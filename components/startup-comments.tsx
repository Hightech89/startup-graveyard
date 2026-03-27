"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { StartupComment } from "@/types/comment";
import { getStartupComments } from "@/src/lib/comments";
import { supabase } from "@/src/lib/supabase";

const MAX_LENGTH = 500;

const sectionClass =
  "mt-10 rounded-[1.2rem] border border-zinc-700 bg-zinc-900/85 p-5 shadow-[0_14px_30px_-18px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.02)]";

const inputClass =
  "mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-50 outline-none ring-orange-500/0 transition placeholder:text-zinc-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15";

type StartupCommentsProps = {
  startupId: string;
  initialComments: StartupComment[];
};

function formatCommentDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function authorLabel(comment: StartupComment, user: User | null) {
  if (user && comment.userId === user.id) {
    return user.email?.trim() || "You";
  }
  return "User";
}

function friendlyInsertError(): string {
  return "Couldn't post your comment. Please try again.";
}

export function StartupComments({
  startupId,
  initialComments,
}: StartupCommentsProps) {
  const [comments, setComments] = useState<StartupComment[]>(initialComments);
  const [user, setUser] = useState<User | null>(null);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reloadComments = useCallback(async () => {
    const next = await getStartupComments(startupId);
    setComments(next);
  }, [startupId]);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments, startupId]);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (mounted) setUser(data.user);
    }

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = body.trim();
    if (!trimmed) {
      setError("Please write something before posting.");
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(`Comments are limited to ${MAX_LENGTH} characters.`);
      return;
    }

    setSubmitting(true);

    const {
      data: { user: current },
      error: userError,
    } = await supabase.auth.getUser();

    const sessionMissing =
      !!userError &&
      /auth session missing|session missing/i.test(userError.message);

    if (!current || sessionMissing) {
      setSubmitting(false);
      setError("You need to be logged in to comment.");
      return;
    }

    if (userError) {
      setSubmitting(false);
      setError("Unable to verify your session. Please try again.");
      return;
    }

    const { error: insertError } = await supabase.from("startup_comments").insert({
      startup_id: startupId,
      user_id: current.id,
      content: trimmed,
    });

    setSubmitting(false);

    if (insertError) {
      setError(friendlyInsertError());
      return;
    }

    setBody("");
    await reloadComments();
  }

  const loggedIn = !!user;
  const length = body.length;

  return (
    <section className={sectionClass} aria-labelledby="comments-heading">
      <h2
        id="comments-heading"
        className="text-lg font-semibold tracking-tight text-zinc-50"
      >
        Comments
      </h2>

      <div className="mt-6 space-y-4">
        {comments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-700/80 bg-zinc-950/40 px-4 py-6 text-center text-sm text-zinc-400">
            No comments yet. Be the first to share your thoughts.
          </p>
        ) : (
          <ul className="space-y-0 divide-y divide-zinc-800/90">
            {comments.map((c) => {
              const when = formatCommentDate(c.createdAt);
              return (
                <li key={c.id} className="py-4 first:pt-0 last:pb-0">
                  <p className="text-sm leading-relaxed text-zinc-200">
                    {c.content}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500">
                    <span className="font-medium text-zinc-400">
                      {authorLabel(c, user)}
                    </span>
                    {when ? (
                      <>
                        <span className="text-zinc-600" aria-hidden>
                          ·
                        </span>
                        <time dateTime={c.createdAt}>{when}</time>
                      </>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-8 border-t border-zinc-700 pt-6">
        {!loggedIn ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 px-4 py-5 text-center">
            <p className="text-sm text-zinc-300">
              Sign in to join the conversation and leave a comment.
            </p>
            <Link
              href="/auth"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-orange-400"
            >
              Log in or sign up
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="comment-body"
                className="text-sm font-semibold text-zinc-300"
              >
                Add a comment
              </label>
              <textarea
                id="comment-body"
                name="comment"
                rows={4}
                maxLength={MAX_LENGTH}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={submitting}
                placeholder="Share your thoughts…"
                className={`${inputClass} min-h-[6rem] resize-y disabled:opacity-60`}
                aria-describedby="comment-counter"
              />
              <p
                id="comment-counter"
                className="mt-1 text-right text-xs tabular-nums text-zinc-500"
              >
                {length}/{MAX_LENGTH}
              </p>
            </div>

            {error ? (
              <p
                className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={
                submitting || !body.trim() || body.trim().length > MAX_LENGTH
              }
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Post comment"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
