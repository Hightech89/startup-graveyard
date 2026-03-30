"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Startup } from "@/types/startup";
import { BackNavLink } from "@/components/back-nav-link";
import { EditStartupForm } from "@/components/edit-startup-form";
import { supabase } from "@/src/lib/supabase";

type EditStartupViewProps = {
  startup: Startup;
};

type Gate = "loading" | "guest" | "forbidden" | "ok";

export function EditStartupView({ startup }: EditStartupViewProps) {
  const router = useRouter();
  const [gate, setGate] = useState<Gate>("loading");

  useEffect(() => {
    let mounted = true;
    let redirectTimer: number | undefined;

    async function check() {
      setGate("loading");
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!mounted) return;

      if (!user) {
        setGate("guest");
        redirectTimer = window.setTimeout(() => {
          if (mounted) router.push("/auth");
        }, 1200);
        return;
      }

      const ownerId = startup.userId;
      if (!ownerId || user.id !== ownerId) {
        setGate("forbidden");
        return;
      }

      setGate("ok");
    }

    void check();

    return () => {
      mounted = false;
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [router, startup.userId]);

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
            href={`/startups/${startup.id}`}
            className="w-full justify-center sm:w-auto"
          >
            Back to startup
          </BackNavLink>
        </div>
      </div>
    );
  }

  return <EditStartupForm startup={startup} />;
}
