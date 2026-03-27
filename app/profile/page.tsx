import type { Metadata } from "next";
import Link from "next/link";
import { AuthStatus } from "@/components/auth-status";
import { ProfileView } from "@/components/profile-view";

export const metadata: Metadata = {
  title: "Profile · Startup Graveyard",
  description: "Your account and submitted startups.",
};

export default function ProfilePage() {
  return (
    <div className="min-h-full bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800/90 bg-[radial-gradient(70%_140%_at_50%_0%,rgba(249,115,22,0.12),rgba(24,24,27,0.88)_42%,#09090b_72%)]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-orange-400 hover:text-orange-300"
            >
              ← Back to graveyard
            </Link>
            <AuthStatus />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Profile
          </h1>
          <p className="mt-2 max-w-xl text-zinc-400">
            Your account and the startups you&apos;ve added to the graveyard.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <ProfileView />
      </main>
    </div>
  );
}
