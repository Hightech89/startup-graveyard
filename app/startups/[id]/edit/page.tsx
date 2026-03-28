import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthStatus } from "@/components/auth-status";
import { EditStartupView } from "@/components/edit-startup-view";
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
    title: `Edit ${startup.name} · Startup Graveyard`,
    description: `Update ${startup.name} on Startup Graveyard.`,
  };
}

export default async function EditStartupPage({ params }: PageProps) {
  const { id } = await params;
  const startup = await getStartupById(id);

  if (!startup) notFound();

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800/90 bg-[radial-gradient(70%_140%_at_50%_0%,rgba(249,115,22,0.12),rgba(24,24,27,0.88)_42%,#09090b_72%)]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-center justify-between gap-4">
            <Link
              href={`/startups/${startup.id}`}
              className="text-sm font-medium text-orange-400 hover:text-orange-300"
            >
              ← Back to startup
            </Link>
            <AuthStatus />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Edit startup
          </h1>
          <p className="mt-2 max-w-xl text-zinc-400">
            Update your submission. Changes apply immediately after you save.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <EditStartupView startup={startup} />
      </main>
    </div>
  );
}
