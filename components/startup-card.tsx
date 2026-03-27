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
    <article className="group relative rounded-[1.2rem] border border-zinc-700 bg-zinc-900/85 p-5 shadow-[0_14px_30px_-18px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.02)] transition-all [border-top-left-radius:2rem] [border-top-right-radius:2rem] hover:-translate-y-0.5 hover:border-zinc-500 hover:bg-zinc-800/95 hover:shadow-[0_18px_34px_-16px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.04)]">
      <Link
        href={detailHref}
        className="absolute inset-0 z-0 block rounded-[1.2rem] [border-top-left-radius:2rem] [border-top-right-radius:2rem]"
        aria-label={`View ${startup.name}`}
      />
      <div className="relative z-10 min-w-0 flex-1 pointer-events-none">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold tracking-tight text-zinc-50 transition-colors group-hover:text-orange-300">
            {startup.name}
          </h3>
          <div className="relative z-20 shrink-0 pointer-events-auto">
            <StartupVoteButton
              key={userHasVoted ? `${startup.id}:v` : `${startup.id}:n`}
              startupId={startup.id}
              count={startup.upvotes}
              initialHasVoted={userHasVoted}
            />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">
            Cause of Death
          </p>
          <div className="mt-2 rounded-xl border border-orange-500/55 bg-zinc-950/90 p-3.5 shadow-[0_0_0_1px_rgba(249,115,22,0.12)]">
            <p className="text-base leading-relaxed text-orange-100">
              {startup.causeOfDeath}
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-zinc-700 pt-5 pb-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Final Lesson
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-100 italic">
            {startup.finalLesson}
          </p>
        </div>

        <ul className="mt-5 flex flex-wrap gap-2">
          {startup.tags.map((tag) => (
            <li key={tag}>
              <span className="inline-flex items-center rounded-md border border-zinc-700/70 bg-zinc-950/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-zinc-500/85">
                {tag}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
