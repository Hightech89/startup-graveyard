"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/components/toast-context";
import { supabase } from "@/src/lib/supabase";

type StartupVoteButtonProps = {
  startupId: string;
  voteCount: number;
  hasVoted: boolean;
};

export function StartupVoteButton({
  startupId,
  voteCount: voteCountProp,
  hasVoted: hasVotedProp,
}: StartupVoteButtonProps) {
  const showToast = useToast();
  const hasVotedFromParent = hasVotedProp === true;

  const [hasVoted, setHasVoted] = useState(hasVotedFromParent);
  const [voteCount, setVoteCount] = useState(voteCountProp);
  const [voting, setVoting] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(false);

  useEffect(() => {
    setVoteCount(voteCountProp);
  }, [startupId, voteCountProp]);

  useEffect(() => {
    setHasVoted(hasVotedProp === true);
  }, [hasVotedProp]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    void supabase.auth.getUser().then(({ data: { user } }) => {
      console.debug("[vote:button]", {
        startupId,
        voteCountProp,
        hasVotedProp,
        hasVotedStrict: hasVotedProp === true,
        userId: user?.id ?? null,
      });
    });
  }, [startupId, voteCountProp, hasVotedProp]);

  async function handleToggleVote() {
    if (voting) return;

    setVoting(true);
    setAuthPrompt(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setVoting(false);
      setAuthPrompt(true);
      showToast("You must be logged in to do that.", "error");
      return;
    }

    const idKey = String(startupId);

    const { data: existingVote, error: existingError } = await supabase
      .from("startup_votes")
      .select("id")
      .eq("startup_id", idKey)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[vote] toggle read error", {
          startupId: idKey,
          error: existingError.message,
        });
      }
      setVoting(false);
      showToast("Something went wrong. Try again.", "error");
      return;
    }

    if (existingVote) {
      const { error: deleteError } = await supabase
        .from("startup_votes")
        .delete()
        .eq("startup_id", idKey)
        .eq("user_id", user.id);

      if (deleteError) {
        if (process.env.NODE_ENV === "development") {
          console.debug("[vote] delete error", {
            startupId: idKey,
            error: deleteError.message,
          });
        }
        setVoting(false);
        showToast("Something went wrong. Try again.", "error");
        return;
      }

      setHasVoted(false);
      setVoteCount((c) => Math.max(0, c - 1));
      setVoting(false);
      showToast("Vote removed");
      return;
    }

    const { error: insertError } = await supabase
      .from("startup_votes")
      .insert({
        startup_id: idKey,
        user_id: user.id,
      });

    if (insertError) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[vote] insert error", {
          startupId: idKey,
          error: insertError.message,
        });
      }
      setVoting(false);
      showToast("Something went wrong. Try again.", "error");
      return;
    }

    setHasVoted(true);
    setVoteCount((c) => c + 1);
    setVoting(false);
    showToast("Vote added");
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
          <Link
            href="/auth"
            className="inline-flex items-center rounded-md border border-orange-500/60 bg-orange-500/15 px-2 py-[2px] text-orange-200 transition hover:bg-orange-500/25"
          >
            Log in
          </Link>
        </div>
      ) : null}
    </div>
  );
}

