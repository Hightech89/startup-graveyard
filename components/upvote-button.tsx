"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";

type UpvoteButtonProps = {
  startupId: string;
  initialUpvotes: number;
  className?: string;
};

export function UpvoteButton({
  startupId,
  initialUpvotes,
  className,
}: UpvoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpvote(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    const previous = upvotes;
    const next = previous + 1;

    setPending(true);
    setError(null);
    setUpvotes(next);

    const { data, error: updateError } = await supabase
      .from("startups")
      .update({ upvotes: next })
      .eq("id", startupId)
      .select("upvotes")
      .single();

    if (updateError) {
      setUpvotes(previous);
      setError("Could not upvote");
    } else if (typeof data?.upvotes === "number") {
      setUpvotes(data.upvotes);
    }

    window.setTimeout(() => setPending(false), 500);
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleUpvote}
        disabled={pending}
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-zinc-700/80 bg-zinc-950/40 px-2 py-1 text-xs font-medium tabular-nums text-zinc-300 transition hover:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-75"
        aria-label="Upvote startup"
      >
        <svg
          className="size-3.5 text-orange-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 5v14M5 12l7-7 7 7" />
        </svg>
        {upvotes}
      </button>
      {error ? <p className="mt-1 text-[11px] text-red-300">{error}</p> : null}
    </div>
  );
}
