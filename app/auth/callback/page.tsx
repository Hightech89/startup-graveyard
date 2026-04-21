"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

function safeNext(raw: string | null): string {
  if (!raw) return "/";
  // Prevent open redirects: only allow same-site relative paths.
  if (!raw.startsWith("/")) return "/";
  if (raw.startsWith("//")) return "/";
  return raw;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = useMemo(() => safeNext(params.get("next")), [params]);
  const [status, setStatus] = useState<"working" | "ok" | "error">("working");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function finalize() {
      try {
        const href = typeof window !== "undefined" ? window.location.href : "";
        const hash = typeof window !== "undefined" ? window.location.hash : "";

        // Email confirmation links carry a session in the URL hash (no PKCE).
        // OAuth/PKCE redirects carry `?code=...` and require `exchangeCodeForSession`.
        const hasAccessTokenInHash = hash.includes("access_token=");
        const hasCodeInQuery =
          typeof window !== "undefined" &&
          new URL(window.location.href).searchParams.has("code");

        if (hasCodeInQuery && !hasAccessTokenInHash) {
          const { error } = await supabase.auth.exchangeCodeForSession(href);
          if (!mounted) return;
          if (error) {
            setStatus("error");
            setMessage(error.message);
            return;
          }
        }

        // Give supabase-js a moment to detect session from the URL hash.
        await new Promise((r) => setTimeout(r, 250));
        if (!mounted) return;

        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;

        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }

        if (data.session) {
          setStatus("ok");
          router.replace(next);
          return;
        }

        setStatus("error");
        setMessage("No session found. Please try logging in again.");
      } catch (err) {
        if (!mounted) return;
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Unknown error");
      }
    }

    void finalize();
    return () => {
      mounted = false;
    };
  }, [router, next]);

  return (
    <div className="min-h-full min-w-0 bg-zinc-950 text-zinc-50">
      <main className="mx-auto min-w-0 max-w-5xl px-4 py-16 sm:px-6">
        <div className="mx-auto w-full min-w-0 max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          {status === "working" ? (
            <>
              <h1 className="text-lg font-semibold text-zinc-50">
                Finishing sign-in…
              </h1>
              <p className="mt-2 text-sm text-zinc-400">
                Please wait a moment.
              </p>
            </>
          ) : status === "ok" ? (
            <>
              <h1 className="text-lg font-semibold text-zinc-50">Signed in</h1>
              <p className="mt-2 text-sm text-zinc-400">Redirecting…</p>
            </>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-zinc-50">
                Couldn&apos;t finish sign-in
              </h1>
              <p className="mt-2 break-words text-sm text-zinc-400">
                {message ?? "Please try again."}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/auth"
                  className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-orange-400"
                >
                  Back to /auth
                </Link>
                <Link
                  href="/"
                  className="text-sm font-medium text-zinc-400 hover:text-zinc-200"
                >
                  Go home
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

