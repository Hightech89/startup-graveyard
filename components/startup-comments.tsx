"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { StartupComment } from "@/types/comment";
import {
  EmptyIconComments,
  EmptyState,
} from "@/components/empty-state";
import { navSecondaryLinkClass } from "@/components/nav-actions";
import { CommentsListSkeleton } from "@/components/page-skeletons";
import { useToast } from "@/components/toast-context";
import { getStartupComments } from "@/src/lib/comments";
import { supabase } from "@/src/lib/supabase";

const MAX_LENGTH = 500;

const sectionClass =
  "mt-10 min-w-0 rounded-[1.2rem] border border-zinc-700 bg-zinc-900/85 p-5 shadow-[0_14px_30px_-18px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.02)]";

const inputClass =
  "mt-1 w-full min-w-0 max-w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-50 outline-none ring-orange-500/0 transition placeholder:text-zinc-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15";

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

function friendlyUpdateError(): string {
  return "Couldn't update your comment. Please try again.";
}

function friendlyDeleteError(): string {
  return "Couldn't delete your comment. Please try again.";
}

const subtleActionClass =
  "text-xs font-medium text-zinc-500 underline-offset-2 transition hover:text-zinc-300 hover:underline";

type CommentRowProps = {
  comment: StartupComment;
  authorLine: string;
  when: string | null;
  isOwner: boolean;
  isEditing: boolean;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  saveDisabled: boolean;
  isSaving: boolean;
  showDeleteConfirm: boolean;
  onRequestDelete: () => void;
  onCancelDeleteConfirm: () => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
};

function CommentRow({
  comment,
  authorLine,
  when,
  isOwner,
  isEditing,
  editValue,
  onEditValueChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  saveDisabled,
  isSaving,
  showDeleteConfirm,
  onRequestDelete,
  onCancelDeleteConfirm,
  onConfirmDelete,
  isDeleting,
}: CommentRowProps) {
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            rows={4}
            maxLength={MAX_LENGTH}
            disabled={isSaving}
            aria-label="Edit comment"
            className={`${inputClass} min-h-[6rem] max-w-full resize-y disabled:opacity-60`}
          />
          <p className="text-right text-xs tabular-nums text-zinc-500">
            {editValue.length}/{MAX_LENGTH}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSaveEdit}
              disabled={saveDisabled || isSaving}
              className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isSaving}
              className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="break-words text-sm leading-relaxed text-zinc-200">
            {comment.content}
          </p>
          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
            <span className="min-w-0 break-all font-medium text-zinc-400 sm:break-words">
              {authorLine}
            </span>
            {when ? (
              <>
                <span className="text-zinc-600" aria-hidden>
                  ·
                </span>
                <time dateTime={comment.createdAt}>{when}</time>
              </>
            ) : null}
            {isOwner ? (
              <>
                <span className="text-zinc-600" aria-hidden>
                  ·
                </span>
                <button
                  type="button"
                  onClick={onStartEdit}
                  disabled={isDeleting || showDeleteConfirm}
                  className={subtleActionClass}
                >
                  Edit
                </button>
                <span className="text-zinc-600" aria-hidden>
                  ·
                </span>
                <button
                  type="button"
                  onClick={onRequestDelete}
                  disabled={isDeleting || showDeleteConfirm}
                  className={`${subtleActionClass} hover:text-red-300`}
                >
                  Delete
                </button>
              </>
            ) : null}
          </div>
          {showDeleteConfirm ? (
            <div className="mt-3 rounded-xl border border-zinc-700 bg-zinc-950/50 px-3 py-3">
              <p className="text-xs text-zinc-400">Delete this comment?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onConfirmDelete}
                  disabled={isDeleting}
                  className="rounded-lg bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? "Deleting…" : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={onCancelDeleteConfirm}
                  disabled={isDeleting}
                  className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </li>
  );
}

export function StartupComments({
  startupId,
  initialComments,
}: StartupCommentsProps) {
  const showToast = useToast();
  const [comments, setComments] = useState<StartupComment[]>(initialComments);
  const [user, setUser] = useState<User | null>(null);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listRefreshing, setListRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reloadComments = useCallback(async () => {
    setListRefreshing(true);
    try {
      const next = await getStartupComments(startupId);
      setComments(next);
    } finally {
      setListRefreshing(false);
    }
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
      showToast("You must be logged in to do that.", "error");
      return;
    }

    if (userError) {
      setSubmitting(false);
      setError("Unable to verify your session. Please try again.");
      showToast("Something went wrong. Try again.", "error");
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
      showToast(friendlyInsertError(), "error");
      return;
    }

    setBody("");
    showToast("Comment posted");
    await reloadComments();
  }

  async function handleSaveEdit(commentId: string) {
    const trimmed = editDraft.trim();
    if (!trimmed) {
      showToast("Please write something before saving.", "error");
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      showToast(`Comments are limited to ${MAX_LENGTH} characters.`, "error");
      return;
    }

    setSavingId(commentId);

    const {
      data: { user: current },
      error: userError,
    } = await supabase.auth.getUser();

    const sessionMissing =
      !!userError &&
      /auth session missing|session missing/i.test(userError.message);

    if (!current || sessionMissing) {
      setSavingId(null);
      showToast("You must be logged in to do that.", "error");
      return;
    }

    if (userError) {
      setSavingId(null);
      showToast("Something went wrong. Try again.", "error");
      return;
    }

    const { data: updatedRows, error: updateError } = await supabase
      .from("startup_comments")
      .update({ content: trimmed })
      .eq("id", commentId)
      .eq("user_id", current.id)
      .select("id");

    setSavingId(null);

    if (updateError || !updatedRows?.length) {
      showToast(friendlyUpdateError(), "error");
      return;
    }

    setEditingId(null);
    setEditDraft("");
    showToast("Comment updated");
    await reloadComments();
  }

  async function handleConfirmDelete(commentId: string) {
    setDeletingId(commentId);

    const {
      data: { user: current },
      error: userError,
    } = await supabase.auth.getUser();

    const sessionMissing =
      !!userError &&
      /auth session missing|session missing/i.test(userError.message);

    if (!current || sessionMissing) {
      setDeletingId(null);
      setPendingDeleteId(null);
      showToast("You must be logged in to do that.", "error");
      return;
    }

    if (userError) {
      setDeletingId(null);
      showToast("Something went wrong. Try again.", "error");
      return;
    }

    const { data: deletedRows, error: deleteError } = await supabase
      .from("startup_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", current.id)
      .select("id");

    setDeletingId(null);
    setPendingDeleteId(null);

    if (deleteError || !deletedRows?.length) {
      showToast(friendlyDeleteError(), "error");
      return;
    }

    if (editingId === commentId) {
      setEditingId(null);
      setEditDraft("");
    }

    showToast("Comment deleted");
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
        {listRefreshing ? (
          <div className="min-h-[10rem]">
            <CommentsListSkeleton />
          </div>
        ) : comments.length === 0 ? (
          <EmptyState
            className="bg-zinc-950/35"
            icon={<EmptyIconComments />}
            title="No comments yet"
            description={
              loggedIn
                ? "Start the conversation."
                : "Sign in to leave the first comment."
            }
            action={
              loggedIn ? undefined : (
                <Link href="/auth" className={navSecondaryLinkClass}>
                  Log in or sign up
                </Link>
              )
            }
          />
        ) : (
          <ul className="space-y-0 divide-y divide-zinc-800/90">
            {comments.map((c) => {
              const when = formatCommentDate(c.createdAt);
              const isOwner = !!user && c.userId === user.id;
              const isEditing = editingId === c.id;
              return (
                <CommentRow
                  key={c.id}
                  comment={c}
                  authorLine={authorLabel(c, user)}
                  when={when}
                  isOwner={isOwner}
                  isEditing={isEditing}
                  editValue={isEditing ? editDraft : ""}
                  onEditValueChange={setEditDraft}
                  onStartEdit={() => {
                    setPendingDeleteId(null);
                    setEditingId(c.id);
                    setEditDraft(c.content);
                  }}
                  onCancelEdit={() => {
                    setEditingId(null);
                    setEditDraft("");
                  }}
                  onSaveEdit={() => handleSaveEdit(c.id)}
                  saveDisabled={
                    !editDraft.trim() || editDraft.trim().length > MAX_LENGTH
                  }
                  isSaving={savingId === c.id}
                  showDeleteConfirm={pendingDeleteId === c.id}
                  onRequestDelete={() => {
                    setEditingId(null);
                    setEditDraft("");
                    setPendingDeleteId(c.id);
                  }}
                  onCancelDeleteConfirm={() => setPendingDeleteId(null)}
                  onConfirmDelete={() => handleConfirmDelete(c.id)}
                  isDeleting={deletingId === c.id}
                />
              );
            })}
          </ul>
        )}
      </div>

      {loggedIn || comments.length > 0 ? (
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
                className={`${inputClass} min-h-[6rem] max-w-full resize-y disabled:opacity-60`}
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
      ) : null}
    </section>
  );
}
