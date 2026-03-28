import Link from "next/link";
import type { Startup } from "@/types/startup";
import { StartupVoteButton } from "./startup-vote-button";

type StartupCardProps = {
  startup: Startup;
  userHasVoted?: boolean;
};

export function StartupCard({ startup, userHasVoted = false }: StartupCardProps) {
  const detailHref = `/startups/${startup.id}`;

  return (
    <article className="group relative rounded-[1.2rem] border border-zinc-700 bg-zinc-900/85 p-6 shadow-[0_14px_30px_-18px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.02)] transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out [border-top-left-radius:2rem] [border-top-right-radius:2rem] hover:-translate-y-0.5 hover:border-zinc-500 hover:bg-zinc-800/95 hover:shadow-[0_20px_40px_-18px_rgba(0,0,0,0.92),0_0_0_1px_rgba(255,255,255,0.05)]">
      <Link
        href={detailHref}
        className="absolute inset-0 z-0 block rounded-[1.2rem] [border-top-left-radius:2rem] [border-top-right-radius:2rem]"
        aria-label={`View ${startup.name}`}
      />
      <div className="relative z-10 min-w-0 flex-1 space-y-6 pointer-events-none">
        <header className="space-y-2.5 pr-1">
          <h3 className="text-lg font-bold leading-snug tracking-tight text-zinc-50 transition-colors duration-200 group-hover:text-orange-200 sm:text-xl">
            {startup.name}
          </h3>
          {startup.shortDescription ? (
            <p className="text-sm leading-relaxed text-zinc-500">
              {startup.shortDescription}
            </p>
          ) : null}
        </header>

        <section className="space-y-2.5" aria-label="Cause of death">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-300/95">
            Cause of Death
          </p>
          <div className="rounded-xl border border-orange-500/50 bg-zinc-950/90 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_0_0_1px_rgba(249,115,22,0.1)]">
            <p className="text-[15px] leading-relaxed text-orange-50 sm:text-base">
              {startup.causeOfDeath}
            </p>
          </div>
        </section>

        <section
          className="rounded-r-xl border-l-2 border-orange-500/30 bg-zinc-950/35 py-3.5 pl-4 pr-3 sm:pl-5"
          aria-label="Final lesson"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Final Lesson
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-200">
            {startup.finalLesson}
          </p>
        </section>

        <footer className="flex flex-col gap-4 border-t border-zinc-800/90 pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
          <ul className="flex min-w-0 flex-1 flex-wrap gap-2 sm:gap-2.5">
            {startup.tags.map((tag) => (
              <li key={tag}>
                <span className="inline-flex items-center rounded-md border border-zinc-700/70 bg-zinc-950/30 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                  {tag}
                </span>
              </li>
            ))}
          </ul>
          <div className="relative z-20 shrink-0 self-end sm:self-auto pointer-events-auto">
            <StartupVoteButton
              key={`vote-${startup.id}`}
              startupId={startup.id}
              voteCount={startup.upvotes}
              hasVoted={userHasVoted === true}
            />
          </div>
        </footer>
      </div>
    </article>
  );
}
