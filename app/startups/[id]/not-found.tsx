import Link from "next/link";

export default function StartupNotFound() {
  return (
    <div className="min-h-full bg-zinc-950 text-zinc-50">
      <main className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
          Startup not found
        </h1>
        <p className="mt-3 text-zinc-400">
          This entry may have been removed or the link is wrong.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-sm font-semibold text-orange-400 hover:text-orange-300"
        >
          ← Back to graveyard
        </Link>
      </main>
    </div>
  );
}
