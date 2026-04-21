import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackNavLink } from "@/components/back-nav-link";
import { SiteHeader } from "@/components/site-header";
import { EditStartupView } from "@/components/edit-startup-view";
import { getStartupById } from "@/src/lib/startups-server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const startup = await getStartupById(id);
  if (!startup) return { title: "Not found · Startup Graveyard" };
  return {
    title: `Edit ${startup.name} · Startup Graveyard`,
    description: `Update ${startup.name} on Startup Graveyard.`,
  };
}

export default async function EditStartupPage({ params }: PageProps) {
  const { id } = await params;
  const startup = await getStartupById(id);

  if (!startup) notFound();

  return (
    <div className="min-h-full min-w-0 bg-zinc-950 text-zinc-50">
      <header className="overflow-x-clip border-b border-zinc-800/90 bg-[radial-gradient(70%_140%_at_50%_0%,rgba(249,115,22,0.12),rgba(24,24,27,0.88)_42%,#09090b_72%)]">
        <div className="mx-auto min-w-0 max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <SiteHeader />
          <div className="mt-4">
            <BackNavLink href={`/startups/${startup.id}`}>
              Back to startup
            </BackNavLink>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Edit startup
          </h1>
          <p className="mt-2 max-w-xl text-zinc-400">
            Update your submission. Changes apply immediately after you save.
          </p>
        </div>
      </header>

      <main className="mx-auto min-w-0 max-w-5xl px-4 py-10 sm:px-6">
        <EditStartupView startup={startup} />
      </main>
    </div>
  );
}
