import type { Startup } from "@/types/startup";
import { UpvoteButton } from "./upvote-button";

const articleClass =
  "rounded-[1.2rem] border border-zinc-700 bg-zinc-900/85 p-5 shadow-[0_14px_30px_-18px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.02)] [border-top-left-radius:2rem] [border-top-right-radius:2rem]";

type StartupDetailProps = {
  startup: Startup;
};

function formatCreatedAt(iso: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function StartupDetail({ startup }: StartupDetailProps) {
  const buried = formatCreatedAt(startup.createdAt);

  return (
    <article className={`min-w-0 ${articleClass}`}>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="min-w-0 break-words text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          {startup.name}
        </h1>
        <div className="shrink-0 self-start sm:self-auto">
          <UpvoteButton startupId={startup.id} initialUpvotes={startup.upvotes} />
        </div>
      </div>

      <p className="mt-4 break-words text-sm leading-relaxed text-zinc-300">
        {startup.shortDescription}
      </p>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">
          Cause of Death
        </p>
        <div className="mt-2 rounded-xl border border-orange-500/55 bg-zinc-950/90 p-3.5 shadow-[0_0_0_1px_rgba(249,115,22,0.12)]">
          <p className="break-words text-base leading-relaxed text-orange-100">
            {startup.causeOfDeath}
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-zinc-700 pt-6 pb-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Final Lesson
        </p>
        <p className="mt-2 break-words text-sm leading-relaxed text-zinc-100 italic">
          {startup.finalLesson}
        </p>
      </div>

      <ul className="mt-6 flex flex-wrap gap-2">
        {startup.tags.map((tag) => (
          <li key={tag} className="min-w-0 max-w-full">
            <span className="inline-flex max-w-full break-words items-center rounded-md border border-zinc-700/70 bg-zinc-950/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-zinc-500/85">
              {tag}
            </span>
          </li>
        ))}
      </ul>

      {buried ? (
        <p className="mt-8 text-xs text-zinc-500">Buried {buried}</p>
      ) : null}
    </article>
  );
}
