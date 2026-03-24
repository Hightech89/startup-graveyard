import type { Metadata } from "next";
import Link from "next/link";
import { SubmitStartupForm } from "@/components/submit-startup-form";

export const metadata: Metadata = {
  title: "Submit startup · Startup Graveyard",
  description: "Add a failed startup to the graveyard.",
};

export default function SubmitPage() {
  return (
    <div className="min-h-full bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800/90 bg-[radial-gradient(70%_140%_at_50%_0%,rgba(249,115,22,0.12),rgba(24,24,27,0.88)_42%,#09090b_72%)]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <Link
            href="/"
            className="text-sm font-medium text-orange-400 hover:text-orange-300"
          >
            ← Back to graveyard
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Submit a startup
          </h1>
          <p className="mt-2 max-w-xl text-zinc-400">
            Lay another idea to rest. Fields map to your Supabase{" "}
            <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-xs text-zinc-300">
              startups
            </code>{" "}
            table.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <SubmitStartupForm />
      </main>
    </div>
  );
}
