"use client";

import { useMemo, useState } from "react";
import type { Startup } from "@/types/startup";
import { StartupCard } from "./startup-card";

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
  const [sort, setSort] = useState<"top" | "az">("top");

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
      return b.upvotes - a.upvotes;
    });
    return sorted;
  }, [selectedTag, sort, startups, query]);

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800/90 bg-[radial-gradient(70%_140%_at_50%_0%,rgba(249,115,22,0.16),rgba(24,24,27,0.88)_42%,#09090b_72%)]">
        <div className="mx-auto max-w-5xl px-4 py-18 sm:px-6 sm:py-24">
          <div className="text-center">
            <h1 className="relative inline-block text-4xl font-extrabold tracking-tight sm:text-5xl">
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-x-8 -inset-y-7 -z-10 rounded-full bg-orange-500/20 blur-3xl"
              />
              Startup Graveyard
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-zinc-300">
              Where ideas go to die — and founders learn why.
            </p>
          </div>

          <div className="mt-10">
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

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-zinc-300">
                  Filters
                </span>
                <div className="flex items-center gap-2">
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
                        "rounded-full border px-3 py-1 text-xs font-semibold transition whitespace-nowrap",
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

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <label htmlFor="sort" className="text-sm font-semibold text-zinc-300">
                  Sort
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as "top" | "az")}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                >
                  <option value="top">Most upvoted</option>
                  <option value="az">A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-50">Recently Buried</h2>
          <p className="text-sm text-zinc-400">
            {filtered.length} of {startups.length}
          </p>
        </div>
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 py-12 text-center text-zinc-400">
            No matches. Try another search.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {filtered.map((startup) => (
              <li key={startup.id}>
                <StartupCard startup={startup} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
