import type { ReactNode } from "react";

const shellClass =
  "mx-auto w-full min-w-0 max-w-md rounded-2xl border border-dashed border-zinc-700/85 bg-zinc-950/30 px-6 py-12 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:max-w-lg sm:px-10 sm:py-14";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={[shellClass, className].filter(Boolean).join(" ")}
    >
      {icon ? (
        <div
          className="mx-auto mb-5 flex size-14 items-center justify-center rounded-xl border border-zinc-800/90 bg-zinc-900/55 text-orange-400/90"
          aria-hidden
        >
          <span className="flex size-7 items-center justify-center [&>svg]:size-7">
            {icon}
          </span>
        </div>
      ) : null}
      <h3 className="break-words text-base font-semibold tracking-tight text-zinc-100">
        {title}
      </h3>
      <p className="mt-2.5 break-words text-sm leading-relaxed text-zinc-400">
        {description}
      </p>
      {action ? (
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:items-center">
          {action}
        </div>
      ) : null}
    </div>
  );
}

export function EmptyIconGravestone() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 5h4a2 2 0 0 1 2 2v15H8V7a2 2 0 0 1 2-2z" />
      <path d="M10 12h4M10 15h3" />
    </svg>
  );
}

export function EmptyIconSearch() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function EmptyIconComments() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

export function EmptyIconSubmissions() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M12 18v-6M9 15h6" />
    </svg>
  );
}
