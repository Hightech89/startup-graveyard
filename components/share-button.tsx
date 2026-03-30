"use client";

import { useToast } from "@/components/toast-context";

type ShareButtonProps = {
  /** Shown as the share title (e.g. startup name). */
  title: string;
  /** Body text for native share (e.g. short description or final lesson). */
  text: string;
};

export function ShareButton({ title, text }: ShareButtonProps) {
  const showToast = useToast();

  async function handleShare() {
    const url =
      typeof window !== "undefined" ? window.location.href : "";

    const shareData: ShareData = {
      title: title.trim() || "Startup Graveyard",
      text: text.trim(),
      url,
    };

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      const canTry =
        !navigator.canShare ||
        (typeof navigator.canShare === "function" &&
          navigator.canShare(shareData));

      if (canTry) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") {
            return;
          }
          // Fall through to clipboard fallback
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied!");
    } catch {
      showToast("Couldn't copy link", "error");
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      title="Share this startup"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-700/80 bg-zinc-950/40 px-2 py-1 text-xs font-semibold text-zinc-300 transition hover:border-zinc-500"
    >
      <svg
        className="size-3.5 text-orange-400/90"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" x2="15.41" y1="13.51" y2="17.49" />
        <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
      </svg>
      <span>Share</span>
    </button>
  );
}
