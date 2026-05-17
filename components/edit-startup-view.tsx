"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Startup, StartupStatus } from "@/types/startup";
import { BackNavLink } from "@/components/back-nav-link";
import { EditStartupForm } from "@/components/edit-startup-form";
import { supabase } from "@/src/lib/supabase";

type EditStartupViewProps = {
  startupId: string;
};

type Gate = "loading" | "guest" | "forbidden" | "ok";

type StartupEditRow = {
  id: string;
  user_id: string;
  name: string;
  short_description: string;
  cause_of_death: string;
  final_lesson: string;
  tags: string[] | null;
  created_at: string;
  status: StartupStatus | null;
};

function mapEditRow(row: StartupEditRow): Startup {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status ?? undefined,
    name: row.name,
    shortDescription: row.short_description,
    causeOfDeath: row.cause_of_death,
    finalLesson: row.final_lesson,
    tags: row.tags ?? [],
    upvotes: 0,
    createdAt: row.created_at,
  };
}

export function EditStartupView({ startupId }: EditStartupViewProps) {
  const router = useRouter();
  const [gate, setGate] = useState<Gate>("loading");
  const [startup, setStartup] = useState<Startup | null>(null);

  useEffect(() => {
    let mounted = true;
    let redirectTimer: number | undefined;

    async function check() {
      setGate("loading");
      const { data: userResult } = await supabase.auth.getUser();
      const user = userResult.user;

      if (!mounted) return;

      if (!user) {
        setGate("guest");
        redirectTimer = window.setTimeout(() => {
          if (mounted) router.push("/auth");
        }, 1200);
        return;
      }

      const { data: startupRow, error } = await supabase
        .from("startups")
        .select(
          "id, user_id, name, short_description, cause_of_death, final_lesson, tags, created_at, status",
        )
        .eq("id", startupId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error || !startupRow) {
        setStartup(null);
        setGate("forbidden");
        return;
      }

      setStartup(mapEditRow(startupRow as StartupEditRow));
      setGate("ok");
    }

    void check();

    return () => {
      mounted = false;
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [router, startupId]);

  if (gate === "loading") {
    return (
      <div className="mx-auto w-full min-w-0 max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-sm text-zinc-400">Checking your session…</p>
      </div>
    );
  }

  if (gate === "guest") {
    return (
      <div className="mx-auto w-full min-w-0 max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-sm text-zinc-200">
          You must be logged in to edit a startup.
        </p>
        <div className="mt-4">
          <Link
            href="/auth"
            className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-orange-400 sm:w-auto"
          >
            Go to /auth
          </Link>
        </div>
      </div>
    );
  }

  if (gate === "forbidden") {
    return (
      <div className="mx-auto w-full min-w-0 max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-sm text-zinc-200">
          You can only edit startups you submitted.
        </p>
        <div className="mt-4 flex flex-col items-stretch sm:items-start">
          <BackNavLink
            href="/profile"
            className="w-full justify-center sm:w-auto"
          >
            Back to profile
          </BackNavLink>
        </div>
      </div>
    );
  }

  if (!startup) {
    return null;
  }

  return <EditStartupForm startup={startup} />;
}
