"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabase";

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data, error: userError } = await supabase.auth.getUser();
      if (!mounted) return;
      if (userError) {
        setError(userError.message);
      } else {
        setUser(data.user);
      }
      setLoading(false);
    }

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setError(null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
    }
    setSigningOut(false);
  }

  if (loading) {
    return <p className="text-sm text-zinc-400">Checking session...</p>;
  }

  if (!user) {
    return (
      <Link href="/auth" className="text-sm font-semibold text-orange-400 hover:text-orange-300">
        Log in / Sign up
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
      <p className="text-sm text-zinc-300">{user.email}</p>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {signingOut ? "Logging out..." : "Log out"}
      </button>
      {error ? <p className="w-full text-right text-xs text-red-400 sm:w-auto">{error}</p> : null}
    </div>
  );
}
