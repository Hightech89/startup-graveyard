"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/src/lib/supabase";

type StartupVoteButtonProps = {
  startupId: string;
  count: number;
  initialHasVoted?: boolean;
};

export function StartupVoteButton({
  startupId,
  count,
  initialHasVoted = false,
}: StartupVoteButtonProps) {
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [voteCount, setVoteCount] = useState(count);
  const [voting, setVoting] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleToggleVote() {
    if (voting) return;

    setVoting(true);
    setActionError(null);
    setAuthPrompt(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setVoting(false);
      setAuthPrompt(true);
      return;
    }

    const { data: existingVote, error: existingError } = await supabase
      .from("startup_votes")
      .select("id")
      .eq("startup_id", startupId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      setVoting(false);
      setActionError("Unable to update vote. Please try again.");
      return;
    }

    if (existingVote) {
      const { error: deleteError } = await supabase
        .from("startup_votes")
        .delete()
        .eq("startup_id", startupId)
        .eq("user_id", user.id);

      if (deleteError) {
        setVoting(false);
        setActionError("Unable to remove vote. Please try again.");
        return;
      }

      setHasVoted(false);
      setVoteCount((c) => Math.max(0, c - 1));
      setVoting(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("startup_votes")
      .insert({
        startup_id: startupId,
        user_id: user.id,
      });

    if (insertError) {
      setVoting(false);
      setActionError("Unable to add vote. Please try again.");
      return;
    }

    setHasVoted(true);
    setVoteCount((c) => c + 1);
    setVoting(false);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleToggleVote}
        disabled={voting}
        aria-pressed={hasVoted}
        className={[
          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium tabular-nums transition",
          hasVoted
            ? "border-orange-500/70 bg-orange-500/15 text-orange-200"
            : "border-zinc-700/80 bg-zinc-950/40 text-zinc-300 hover:border-zinc-500",
        ].join(" ")}
        title={hasVoted ? "Remove upvote" : "Upvote"}
      >
        <svg
          className={[
            "size-3.5",
            hasVoted ? "text-orange-300" : "text-orange-400",
          ].join(" ")}
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
        <span>{voteCount}</span>
      </button>

      {authPrompt ? (
        <div className="text-right text-[11px] text-zinc-400">
          You must be logged in to vote.{" "}
          <Link
            href="/auth"
            className="ml-1 inline-flex items-center rounded-md border border-orange-500/60 bg-orange-500/15 px-2 py-[2px] text-orange-200 transition hover:bg-orange-500/25"
          >
            Log in
          </Link>
        </div>
      ) : null}

      {actionError ? (
        <p className="text-right text-[11px] text-red-400">{actionError}</p>
      ) : null}
    </div>
  );
}

