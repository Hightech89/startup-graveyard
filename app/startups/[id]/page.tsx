import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthStatus } from "@/components/auth-status";
import { StartupComments } from "@/components/startup-comments";
import { StartupDetailClient } from "@/components/startup-detail-client";
import { getStartupComments } from "@/src/lib/comments";
import { getStartupById } from "@/src/lib/startups";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const startup = await getStartupById(id);
  if (!startup) return { title: "Not found · Startup Graveyard" };
  return {
    title: `${startup.name} · Startup Graveyard`,
    description: startup.shortDescription,
  };
}

export default async function StartupPage({ params }: PageProps) {
  const { id } = await params;
  const startup = await getStartupById(id);

  if (!startup) notFound();

  const comments = await getStartupComments(startup.id);

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
            Startup
          </h1>
          <p className="mt-2 max-w-xl text-zinc-400">
            Upvote what’s worth saving. Learn why it didn’t make it.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <StartupDetailClient startup={startup} />
        <div className="mx-auto max-w-3xl">
          <StartupComments
            startupId={startup.id}
            initialComments={comments}
          />
        </div>
      </main>
    </div>
  );
}
