"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { SubmitStartupForm } from "@/components/submit-startup-form";

export function SubmitAuthGuard() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    let redirectTimer: number | undefined;

    async function checkSession() {
      setChecking(true);

      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!mounted) return;

      setAuthed(!!user);

      setChecking(false);

      // Optional short delay redirect to the auth page.
      if (!user) {
        redirectTimer = window.setTimeout(() => {
          if (mounted) router.push("/auth");
        }, 1200);
      }
    }

    checkSession();

    return () => {
      mounted = false;
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [router]);

  if (checking) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-sm text-zinc-400">Checking your session…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-sm text-zinc-200">
          You must be logged in to submit a startup.
        </p>
        <div className="mt-4">
          <Link
            href="/auth"
            className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-orange-400"
          >
            Go to /auth
          </Link>
        </div>
      </div>
    );
  }

  return <SubmitStartupForm />;
}

