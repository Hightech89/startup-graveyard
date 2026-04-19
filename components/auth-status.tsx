"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AuthHeaderSkeleton } from "@/components/auth-header-skeleton";
import { logoutButtonClass, navSecondaryLinkClass } from "@/components/nav-actions";
import { supabase } from "@/src/lib/supabase";

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadNickname(userId: string) {
      const { data, error: nicknameError } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted) return;
      if (nicknameError) {
        setNickname(null);
        return;
      }

      const value =
        typeof data?.nickname === "string" ? data.nickname.trim() : "";
      setNickname(value.length > 0 ? value : null);
    }

    async function loadUser() {
      const { data, error: userError } = await supabase.auth.getUser();
      if (!mounted) return;
      if (userError) {
        setError(userError.message);
        setNickname(null);
      } else {
        setUser(data.user);
        if (data.user?.id) {
          void loadNickname(data.user.id);
        } else {
          setNickname(null);
        }
      }
      setLoading(false);
    }

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        void loadNickname(session.user.id);
      } else {
        setNickname(null);
      }
      setError(null);
      setLoading(false);
    });

    function onNicknameUpdated(event: Event) {
      const custom = event as CustomEvent<{ nickname: string | null }>;
      const value = custom.detail?.nickname?.trim() ?? "";
      setNickname(value.length > 0 ? value : null);
    }
    window.addEventListener("profile:nickname-updated", onNicknameUpdated as EventListener);

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      window.removeEventListener(
        "profile:nickname-updated",
        onNicknameUpdated as EventListener,
      );
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
    return <AuthHeaderSkeleton />;
  }

  if (!user) {
    return (
      <Link href="/auth" className={navSecondaryLinkClass}>
        Log in / Sign up
      </Link>
    );
  }

  return (
    <div className="flex min-w-0 max-w-full flex-col items-end gap-1.5 sm:max-w-none sm:gap-2">
      <div className="flex min-w-0 w-full max-w-full flex-wrap items-center justify-end gap-x-2 gap-y-1.5 sm:w-auto">
        <Link href="/profile" className={navSecondaryLinkClass}>
          Profile
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className={logoutButtonClass}
        >
          {signingOut ? "Logging out..." : "Log out"}
        </button>
      </div>
      <span
        className="max-w-full truncate text-right text-[11px] leading-snug text-zinc-500 sm:max-w-[min(100%,15rem)]"
        title={nickname ? `Hello, ${nickname}` : (user.email ?? undefined)}
      >
        {nickname ? `Hello, ${nickname}` : user.email}
      </span>
      {error ? (
        <p className="w-full max-w-full text-right text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
