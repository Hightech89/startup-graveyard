import type { Metadata } from "next";
import { BackNavLink } from "@/components/back-nav-link";
import { SiteHeader } from "@/components/site-header";
import { ProfileView } from "@/components/profile-view";

export const metadata: Metadata = {
  title: "Profile · Startup Graveyard",
  description: "Your account and submitted startups.",
};

export default function ProfilePage() {
  return (
    <div className="min-h-full min-w-0 bg-zinc-950 text-zinc-50">
      <header className="overflow-x-clip border-b border-zinc-800/90 bg-[radial-gradient(70%_140%_at_50%_0%,rgba(249,115,22,0.12),rgba(24,24,27,0.88)_42%,#09090b_72%)]">
        <div className="mx-auto min-w-0 max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <SiteHeader />
          <div className="mt-4">
            <BackNavLink href="/">Back to graveyard</BackNavLink>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Profile
          </h1>
          <p className="mt-2 max-w-xl text-zinc-400">
            Your account and the startups you&apos;ve added to the graveyard.
          </p>
        </div>
      </header>

      <main className="mx-auto min-w-0 max-w-5xl px-4 py-10 sm:px-6">
        <ProfileView />
      </main>
    </div>
  );
}
