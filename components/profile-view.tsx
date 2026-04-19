"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Startup } from "@/types/startup";
import { useToast } from "@/components/toast-context";
import { getStartupsByUserId } from "@/src/lib/startups";
import { supabase } from "@/src/lib/supabase";
import {
  EmptyIconSubmissions,
  EmptyState,
} from "@/components/empty-state";
import { navPrimaryLinkClass } from "@/components/nav-actions";
import {
  ProfileContentSkeleton,
  ProfileSubmissionsGridSkeleton,
} from "@/components/page-skeletons";
import { StartupCard } from "./startup-card";
import { StartupOwnerActions } from "./startup-owner-actions";

type ProfileRow = {
  id: string;
  nickname: string | null;
};

const MAX_NICKNAME_LENGTH = 20;

function logProfileEvent(event: string, payload?: unknown) {
  console.info(`[profile] ${event}`, payload ?? "");
}

function logProfileError(event: string, error: unknown) {
  const e = error as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  };
  console.error(`[profile] ${event}`, {
    code: e?.code ?? null,
    message: e?.message ?? String(error),
    details: e?.details ?? null,
    hint: e?.hint ?? null,
  });
}

function profileErrorMessage(error: { code?: string; message?: string } | null) {
  if (!error) return "Profile could not be loaded.";
  if (error.code === "42P01") {
    return "Profiles table is missing. Run the profiles SQL in Supabase.";
  }
  if (error.code === "42501") {
    return "Profile permissions are blocking access. Check profiles RLS policies.";
  }
  return "Profile could not be loaded.";
}

export function ProfileView() {
  const showToast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loadingStartups, setLoadingStartups] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [nickname, setNickname] = useState("");
  const [savingNickname, setSavingNickname] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      logProfileEvent("auth.getUser", { userId: data.user?.id ?? null });
      setUser(data.user);
      setLoading(false);
    }

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const reloadSubmissions = useCallback(async () => {
    if (!user) return;
    setLoadingStartups(true);
    try {
      const list = await getStartupsByUserId(user.id);
      setStartups(list);

      if (list.length === 0) {
        setVotedIds(new Set());
        return;
      }

      const ids = [
        ...new Set(
          list
            .map((s) => String(s.id))
            .filter((id) => id.length > 0),
        ),
      ];

      const { data: votes, error: votesError } = await supabase
        .from("startup_votes")
        .select("startup_id")
        .eq("user_id", user.id)
        .in("startup_id", ids);

      if (votesError || !votes) {
        setVotedIds(new Set());
        return;
      }

      setVotedIds(
        new Set(
          votes
            .map((v) => (v.startup_id != null ? String(v.startup_id) : ""))
            .filter(Boolean),
        ),
      );
    } finally {
      setLoadingStartups(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setStartups([]);
      setVotedIds(new Set());
      return;
    }

    void reloadSubmissions();
  }, [user, reloadSubmissions]);

  useEffect(() => {
    if (!user) {
      setNickname("");
      setLoadingProfile(false);
      return;
    }

    let mounted = true;
    const userId = user.id;

    async function loadOrCreateProfile() {
      setLoadingProfile(true);
      logProfileEvent("profile.select.start", { userId });
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nickname")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted) return;
      if (error) {
        logProfileError("profile.select.error", error);
        showToast(profileErrorMessage(error), "error");
        setLoadingProfile(false);
        return;
      }
      logProfileEvent("profile.select.result", { userId, found: !!data });

      if (data) {
        const row = data as ProfileRow;
        setNickname(row.nickname ?? "");
        setLoadingProfile(false);
        return;
      }

      logProfileEvent("profile.upsert.start", { userId });
      const { data: inserted, error: insertError } = await supabase
        .from("profiles")
        .upsert(
          { id: userId, nickname: null, updated_at: new Date().toISOString() },
          { onConflict: "id" },
        )
        .select("id, nickname")
        .single();

      if (!mounted) return;
      if (insertError) {
        logProfileError("profile.upsert.error", insertError);
        showToast(profileErrorMessage(insertError), "error");
        setLoadingProfile(false);
        return;
      }
      logProfileEvent("profile.upsert.result", {
        userId,
        insertedId: (inserted as ProfileRow | null)?.id ?? null,
      });

      const row = inserted as ProfileRow;
      setNickname(row.nickname ?? "");
      setLoadingProfile(false);
    }

    void loadOrCreateProfile();
    return () => {
      mounted = false;
    };
  }, [user, showToast]);

  async function handleSaveNickname(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSavingNickname(true);
    const value = nickname.trim();
    if (value.length > MAX_NICKNAME_LENGTH) {
      setSavingNickname(false);
      showToast("Nickname must be 20 characters or fewer.", "error");
      return;
    }
    const safeValue = value.slice(0, MAX_NICKNAME_LENGTH);
    logProfileEvent("profile.nickname.upsert.start", {
      userId: user.id,
      hasNickname: safeValue.length > 0,
    });
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      nickname: safeValue.length > 0 ? safeValue : null,
      updated_at: new Date().toISOString(),
    });

    setSavingNickname(false);
    if (error) {
      logProfileError("profile.nickname.upsert.error", error);
      showToast(profileErrorMessage(error), "error");
      return;
    }
    logProfileEvent("profile.nickname.upsert.success", {
      userId: user.id,
      nickname: safeValue || null,
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("profile:nickname-updated", {
          detail: { nickname: safeValue || null },
        }),
      );
    }
    showToast("Profile updated");
    setNickname("");
  }

  if (loading) {
    return <ProfileContentSkeleton />;
  }

  if (!user) {
    return (
      <div className="w-full min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-sm text-zinc-200">
          Sign in to view your profile and the startups you&apos;ve submitted.
        </p>
        <div className="mt-4">
          <Link
            href="/auth"
            className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-orange-400 sm:w-auto"
          >
            Log in or sign up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Email
        </p>
        <p className="mt-1 break-all text-lg font-medium text-zinc-100">
          {user.email}
        </p>
        <form onSubmit={handleSaveNickname} className="mt-6 max-w-md">
          <label
            htmlFor="nickname"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
          >
            Nickname
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            value={nickname}
            onChange={(e) =>
              setNickname(e.target.value.slice(0, MAX_NICKNAME_LENGTH))
            }
            maxLength={MAX_NICKNAME_LENGTH}
            disabled={loadingProfile || savingNickname}
            placeholder="No nickname yet"
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-50 outline-none ring-orange-500/0 transition placeholder:text-zinc-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 disabled:opacity-60"
          />
          <p className="mt-1 text-right text-xs tabular-nums text-zinc-500">
            {nickname.length} / {MAX_NICKNAME_LENGTH}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={loadingProfile || savingNickname}
              className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingNickname ? "Saving..." : "Save nickname"}
            </button>
            {loadingProfile ? (
              <p className="text-xs text-zinc-500">Loading profile…</p>
            ) : null}
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-50">Your submissions</h2>

        {loadingStartups ? (
          <div className="mt-6">
            <ProfileSubmissionsGridSkeleton />
          </div>
        ) : startups.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<EmptyIconSubmissions />}
              title="No submissions yet"
              description="Add a startup to the graveyard and it will show up here."
              action={
                <Link href="/submit" className={navPrimaryLinkClass}>
                  Submit a startup
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {startups.map((s) => (
              <li key={s.id} className="space-y-2">
                {s.userId ? (
                  <StartupOwnerActions
                    startupId={s.id}
                    ownerUserId={s.userId}
                    onDeleted={reloadSubmissions}
                  />
                ) : null}
                <StartupCard
                  startup={{
                    ...s,
                    authorName:
                      s.authorName && s.authorName.trim().length > 0
                        ? s.authorName
                        : (user.email ?? undefined),
                  }}
                  userHasVoted={votedIds.has(String(s.id))}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
