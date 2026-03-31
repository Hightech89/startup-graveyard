"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { BackNavLink } from "@/components/back-nav-link";
import { SiteHeader } from "@/components/site-header";
import { friendlyAuthError, useToast } from "@/components/toast-context";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const showToast = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const redirectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (mounted) setUser(data.user);
    }

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (loginError) {
      showToast(friendlyAuthError(loginError.message), "error");
    } else {
      showToast("Signed in");
      redirectTimeoutRef.current = window.setTimeout(() => {
        router.push("/");
      }, 1200);
    }

    setLoginLoading(false);
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignupLoading(true);

    const { error: signupError } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
    });

    if (signupError) {
      showToast(friendlyAuthError(signupError.message), "error");
    } else {
      showToast("Account created. Check your email if confirmation is required.");
      redirectTimeoutRef.current = window.setTimeout(() => {
        router.push("/");
      }, 1200);
    }

    setSignupLoading(false);
  }

  return (
    <div className="min-h-full min-w-0 bg-zinc-950 text-zinc-50">
      <header className="overflow-x-clip border-b border-zinc-800/90 bg-[radial-gradient(70%_140%_at_50%_0%,rgba(249,115,22,0.12),rgba(24,24,27,0.88)_42%,#09090b_72%)]">
        <div className="mx-auto min-w-0 max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <SiteHeader />
          <div className="mt-4">
            <BackNavLink href="/">Back to graveyard</BackNavLink>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Account</h1>
          <p className="mt-2 max-w-xl text-zinc-400">
            Use email and password to sign up or log in.
          </p>
        </div>
      </header>

      <main className="mx-auto min-w-0 max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid min-w-0 gap-6 md:grid-cols-2">
          <section className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-lg font-semibold text-zinc-50">Log in</h2>
            <form onSubmit={handleLogin} className="mt-4 space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-1 block text-sm text-zinc-300">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full min-w-0 max-w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-zinc-50 outline-none ring-orange-500/0 transition-[box-shadow,border-color] placeholder:text-zinc-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="mb-1 block text-sm text-zinc-300">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full min-w-0 max-w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-zinc-50 outline-none ring-orange-500/0 transition-[box-shadow,border-color] placeholder:text-zinc-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                />
              </div>
              <button
                type="submit"
                disabled={loginLoading || signupLoading}
                className="w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loginLoading ? "Logging in..." : "Log in"}
              </button>
            </form>
          </section>

          <section className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-lg font-semibold text-zinc-50">Sign up</h2>
            <form onSubmit={handleSignup} className="mt-4 space-y-4">
              <div>
                <label htmlFor="signup-email" className="mb-1 block text-sm text-zinc-300">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  className="w-full min-w-0 max-w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-zinc-50 outline-none ring-orange-500/0 transition-[box-shadow,border-color] placeholder:text-zinc-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="mb-1 block text-sm text-zinc-300">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  className="w-full min-w-0 max-w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-zinc-50 outline-none ring-orange-500/0 transition-[box-shadow,border-color] placeholder:text-zinc-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                />
              </div>
              <button
                type="submit"
                disabled={signupLoading || loginLoading}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {signupLoading ? "Signing up..." : "Sign up"}
              </button>
            </form>
          </section>
        </div>

        <div className="mt-6 space-y-2">
          {user ? (
            <p className="text-sm text-zinc-300">
              Signed in as{" "}
              <span className="break-all font-medium text-zinc-100">{user.email}</span>.
            </p>
          ) : (
            <p className="text-sm text-zinc-400">You are currently signed out.</p>
          )}
        </div>
      </main>
    </div>
  );
}
