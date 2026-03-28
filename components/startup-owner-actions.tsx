"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useToast } from "@/components/toast-context";
import { supabase } from "@/src/lib/supabase";

const subtleActionClass =
  "text-xs font-medium text-zinc-500 underline-offset-2 transition hover:text-zinc-300 hover:underline";

function friendlyDeleteError(): string {
  return "Couldn't delete this startup. Please try again.";
}

type StartupOwnerActionsProps = {
  startupId: string;
  ownerUserId: string;
  /** Called after a successful delete (e.g. refetch profile list). Default: go home. */
  onDeleted?: () => void;
};

export function StartupOwnerActions({
  startupId,
  ownerUserId,
  onDeleted,
}: StartupOwnerActionsProps) {
  const showToast = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (mounted) setUser(data.user);
    }

    void loadUser();

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

  const isOwner = !!user && user.id === ownerUserId;

  if (!isOwner) {
    return null;
  }

  async function confirmDelete() {
    setDeleting(true);

    const {
      data: { user: current },
      error: userError,
    } = await supabase.auth.getUser();

    const sessionMissing =
      !!userError &&
      /auth session missing|session missing/i.test(userError.message);

    if (!current || sessionMissing) {
      setDeleting(false);
      setShowConfirm(false);
      showToast("You must be logged in to do that.", "error");
      return;
    }

    if (userError) {
      setDeleting(false);
      setShowConfirm(false);
      showToast("Something went wrong. Try again.", "error");
      return;
    }

    const { data: deletedRows, error: deleteError } = await supabase
      .from("startups")
      .delete()
      .eq("id", startupId)
      .eq("user_id", current.id)
      .select("id");

    setDeleting(false);
    setShowConfirm(false);

    if (deleteError || !deletedRows?.length) {
      showToast(friendlyDeleteError(), "error");
      return;
    }

    showToast("Startup deleted");
    if (onDeleted) {
      onDeleted();
    } else {
      router.push("/");
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
      <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
        <Link
          href={`/startups/${startupId}/edit`}
          className={subtleActionClass}
        >
          Edit
        </Link>
        <span className="text-zinc-600" aria-hidden>
          ·
        </span>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={deleting || showConfirm}
          className={`${subtleActionClass} hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Delete
        </button>
      </div>

      {showConfirm ? (
        <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-950/50 px-3 py-3 sm:w-auto">
          <p className="text-xs text-zinc-400">
            Delete this startup permanently?
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={deleting}
              className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
