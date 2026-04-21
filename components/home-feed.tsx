"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Startup } from "@/types/startup";
import {
  EmptyIconGravestone,
  EmptyIconSearch,
  EmptyState,
} from "@/components/empty-state";
import { navPrimaryLinkClass } from "@/components/nav-actions";
import { AuthStatus } from "./auth-status";
import { StartupCard } from "./startup-card";
import { supabase } from "@/src/lib/supabase";

type HomeFeedProps = {
  startups: Startup[];
};

function matchesQuery(startup: Startup, q: string) {
  if (!q.trim()) return true;
  const needle = q.toLowerCase();
  return (
    startup.name.toLowerCase().includes(needle) ||
    startup.finalLesson.toLowerCase().includes(needle) ||
    startup.causeOfDeath.toLowerCase().includes(needle) ||
    startup.tags.some((t) => t.toLowerCase().includes(needle))
  );
}

export function HomeFeed({ startups }: HomeFeedProps) {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sort, setSort] = useState<"newest" | "top" | "az">("top");
  const [userVotedStartupIds, setUserVotedStartupIds] = useState<Set<string>>(
    new Set(),
  );

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of startups) {
      for (const t of s.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag)
      .slice(0, 10);
  }, [startups]);

  const filtered = useMemo(() => {
    const base = startups.filter((s) => matchesQuery(s, query));
    const tagged = selectedTag ? base.filter((s) => s.tags.includes(selectedTag)) : base;
    const sorted = [...tagged].sort((a, b) => {
      if (sort === "az") return a.name.localeCompare(b.name);
      if (sort === "newest") {
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        return (
          (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta)
        );
      }
      // Top: upvotes on Startup are vote counts from startup_votes (see getStartups).
      return b.upvotes - a.upvotes;
    });
    return sorted;
  }, [selectedTag, sort, startups, query]);

  const topStartups = useMemo(() => {
    if (startups.length === 0) return [];
    const base = startups.map((s) => ({
      startup: s,
      displayVotes: s.upvotes,
      id: String(s.id),
    }));
    return base
      .sort(
        (a, b) =>
          b.displayVotes - a.displayVotes ||
          a.startup.name.localeCompare(b.startup.name),
      )
      .slice(0, 5);
  }, [startups]);

  const recentStartups = useMemo(() => {
    const topIds = new Set(topStartups.map((t) => String(t.startup.id)));
    const remaining = startups.filter((s) => !topIds.has(String(s.id)));
    const base = remaining.filter((s) => matchesQuery(s, query));
    const tagged = selectedTag ? base.filter((s) => s.tags.includes(selectedTag)) : base;
    // Recently Buried is always newest-first (distinct from Top Startups).
    return [...tagged].sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
    });
  }, [startups, topStartups, query, selectedTag]);

  useEffect(() => {
    let mounted = true;

    async function loadVoteState() {
      const ids = [
        ...new Set(
          startups
            .map((s) => String(s.id))
            .filter((id) => id.length > 0),
        ),
      ];

      if (ids.length === 0) {
        if (mounted) {
          setUserVotedStartupIds(new Set());
        }
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!mounted) return;

      const idAllow = new Set(ids);

      if (userError || !user) {
        setUserVotedStartupIds(new Set());
        return;
      }

      const { data: myVoteRows, error: myVotesError } = await supabase
        .from("startup_votes")
        .select("startup_id")
        .eq("user_id", user.id)
        .in("startup_id", ids);

      if (!mounted) return;

      if (myVotesError || !myVoteRows) {
        if (process.env.NODE_ENV === "development") {
          console.debug("[vote:home] my votes query", {
            userId: user.id,
            error: myVotesError?.message ?? null,
          });
        }
        setUserVotedStartupIds(new Set());
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.debug("[vote:home] my vote rows (raw startup_id)", {
          userId: user.id,
          rows: myVoteRows.map((r) => r.startup_id),
        });
      }

      const voted = new Set<string>();
      for (const row of myVoteRows) {
        const sid =
          row.startup_id != null ? String(row.startup_id) : "";
        if (sid && idAllow.has(sid)) voted.add(sid);
      }

      if (process.env.NODE_ENV === "development") {
        console.debug("[vote:home] userVotedStartupIds (final)", [
          ...voted,
        ]);
      }

      setUserVotedStartupIds(voted);
    }

    void loadVoteState();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      void loadVoteState();
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [startups]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (startups.length === 0) return;
    for (const s of filtered.slice(0, 20)) {
      const id = String(s.id);
      const hasVoted = userVotedStartupIds.has(id);
      console.debug("[vote:home] card", {
        startupId: id,
        voteCount: s.upvotes,
        hasVoted,
        serverUpvotes: s.upvotes,
      });
    }
  }, [filtered, startups.length, userVotedStartupIds]);

  return (
    <div className="min-h-full min-w-0 bg-zinc-950 text-zinc-50">
      <header className="overflow-x-clip border-b border-zinc-800/90 bg-[radial-gradient(70%_140%_at_50%_0%,rgba(249,115,22,0.16),rgba(24,24,27,0.88)_42%,#09090b_72%)]">
        <div className="mx-auto max-w-5xl min-w-0 px-4 py-18 sm:px-6 sm:py-24">
          <div className="mb-8 flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
            <AuthStatus />
          </div>
          <div className="text-center">
            <h1 className="relative inline-block max-w-full text-4xl font-extrabold tracking-tight sm:text-5xl">
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-y-7 -z-10 max-sm:-inset-x-4 sm:-inset-x-8 rounded-full bg-orange-500/20 blur-3xl"
              />
              Startup Graveyard
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-zinc-300">
              Where ideas go to die — and founders learn why.
            </p>
            <div className="mt-5 flex justify-center px-1">
              <Link href="/submit" className={navPrimaryLinkClass}>
                Submit a startup
              </Link>
            </div>
          </div>

          <div className="mt-10 min-w-0">
            <label htmlFor="startup-search" className="sr-only">
              Search startups
            </label>

            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-zinc-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                id="startup-search"
                type="search"
                placeholder="Search by name, tag, or cause of death…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pl-11 pr-4 text-zinc-50 shadow-inner outline-none ring-orange-500/0 transition-[box-shadow,border-color] placeholder:text-zinc-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
              />
            </div>

            <div className="mt-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 max-w-full flex-wrap items-start gap-x-3 gap-y-2 sm:items-center">
                <span className="shrink-0 pt-0.5 text-sm font-semibold text-zinc-300 sm:pt-0">
                  Filters
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTag(null)}
                    className={[
                      "rounded-full border px-3 py-1 text-xs font-semibold transition",
                      selectedTag === null
                        ? "border-orange-500 bg-orange-500/15 text-orange-300"
                        : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700",
                    ].join(" ")}
                  >
                    All tags
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={[
                        "max-w-full truncate rounded-full border px-3 py-1 text-xs font-semibold transition",
                        selectedTag === tag
                          ? "border-orange-500 bg-orange-500/15 text-orange-300"
                          : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700",
                      ].join(" ")}
                      aria-pressed={selectedTag === tag}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-w-0 w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
                <label
                  htmlFor="sort"
                  className="shrink-0 text-sm font-semibold text-zinc-300"
                >
                  Sort
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) =>
                    setSort(e.target.value as "newest" | "top" | "az")
                  }
                  className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 sm:min-w-[9rem] sm:flex-none"
                  aria-label="Sort startups"
                >
                  <option value="newest">Newest</option>
                  <option value="top">Top</option>
                  <option value="az">A–Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto min-w-0 max-w-5xl px-4 py-10 sm:px-6">
        {startups.length > 0 ? (
          <section className="mb-10">
            <div className="mb-6 flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
              <h2 className="min-w-0 break-words text-lg font-semibold text-zinc-50">
                Top Startups
              </h2>
            </div>
            <ul className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {topStartups.slice(0, 5).map(({ startup, id }) => (
                <li key={`top-${startup.id}`}>
                  <StartupCard
                    startup={startup}
                    userHasVoted={userVotedStartupIds.has(id)}
                  />
                </li>
              ))}
            </ul>
            <div className="mt-10 border-t border-zinc-800/90" aria-hidden />
          </section>
        ) : null}

        <div className="mb-6 flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h2 className="min-w-0 break-words text-lg font-semibold text-zinc-50">
            Recently Buried
          </h2>
        </div>
        {startups.length === 0 ? (
          <EmptyState
            icon={<EmptyIconGravestone />}
            title="No startups yet"
            description="Be the first to add one."
            action={
              <Link href="/submit" className={navPrimaryLinkClass}>
                Submit a startup
              </Link>
            }
          />
        ) : recentStartups.length === 0 ? (
          <EmptyState
            icon={<EmptyIconSearch />}
            title="No results found"
            description="Try adjusting your search or filters."
            action={
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedTag(null);
                }}
                className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-zinc-600 bg-zinc-900/50 px-5 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800/60 sm:w-auto"
              >
                Clear search &amp; filters
              </button>
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {recentStartups.map((startup) => {
              const id = String(startup.id);
              return (
                <li key={startup.id}>
                  <StartupCard
                    startup={startup}
                    userHasVoted={userVotedStartupIds.has(id)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
