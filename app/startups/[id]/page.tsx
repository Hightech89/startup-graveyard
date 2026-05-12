import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackNavLink } from "@/components/back-nav-link";
import { AuthStatus } from "@/components/auth-status";
import { StartupComments } from "@/components/startup-comments";
import { StartupDetailClient } from "@/components/startup-detail-client";
import { getStartupComments } from "@/src/lib/comments";
import { getStartupById } from "@/src/lib/startups-server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const startup = await getStartupById(id);
  if (!startup) return { title: "Not found" };

  const title = startup.name.trim() || "Untitled startup";
  const description = startup.shortDescription;
  const path = `/startups/${startup.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "article",
      url: path,
      title: `${title} | Startup Graveyard`,
      description,
      siteName: "Startup Graveyard",
    },
    twitter: {
      card: "summary",
      title: `${title} | Startup Graveyard`,
      description,
    },
  };
}

export default async function StartupPage({ params }: PageProps) {
  const { id } = await params;
  const startup = await getStartupById(id);

  if (!startup) notFound();

  const comments = await getStartupComments(startup.id);
  const titleName = startup.name.trim() || "Untitled";

  return (
    <div className="min-h-full min-w-0 bg-zinc-950 text-zinc-50">
      <header className="overflow-x-clip border-b border-zinc-800/90 bg-[radial-gradient(70%_140%_at_50%_0%,rgba(249,115,22,0.12),rgba(24,24,27,0.88)_42%,#09090b_72%)]">
        <div className="mx-auto min-w-0 max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 sm:gap-3">
            <BackNavLink href="/">Back to graveyard</BackNavLink>
            <AuthStatus />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="min-w-0 break-words">{titleName}</span>
            <span className="font-normal text-zinc-500"> · Startup Graveyard</span>
          </h1>
          <p className="mt-2 max-w-xl text-zinc-400">
            Upvote what’s worth saving. Learn why it didn’t make it.
          </p>
        </div>
      </header>

      <main className="mx-auto min-w-0 max-w-5xl px-4 py-10 sm:px-6">
        <StartupDetailClient startup={startup} />
        <div className="mx-auto min-w-0 max-w-3xl">
          <StartupComments
            startupId={startup.id}
            initialComments={comments}
          />
        </div>
      </main>
    </div>
  );
}
