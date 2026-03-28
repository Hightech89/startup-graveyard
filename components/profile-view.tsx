"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Startup } from "@/types/startup";
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

export function ProfileView() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loadingStartups, setLoadingStartups] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
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

  if (loading) {
    return <ProfileContentSkeleton />;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
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
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Email
        </p>
        <p className="mt-1 break-all text-lg font-medium text-zinc-100">
          {user.email}
        </p>
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
                  startup={s}
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
