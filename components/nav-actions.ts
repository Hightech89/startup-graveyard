/**
 * Shared header / hero action links (Next.js Link class strings).
 * Primary = filled accent; secondary = outline / subtle fill.
 */
export const navPrimaryLinkClass =
  "inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-orange-500 px-4 py-2 text-center text-sm font-semibold text-zinc-950 shadow-[0_1px_0_rgba(0,0,0,0.18)] transition hover:bg-orange-400 active:scale-[0.98] active:bg-orange-600 sm:px-5";

export const navSecondaryLinkClass =
  "inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-orange-500/50 bg-orange-500/10 px-4 py-2 text-center text-sm font-semibold text-orange-200 transition hover:border-orange-400/70 hover:bg-orange-500/15 hover:text-orange-100 active:scale-[0.98] active:bg-orange-500/20 sm:px-5";

/** Subtle gray pill for “back” navigation (matches rounded control style, not orange CTA). */
export const backNavLinkClass =
  "inline-flex min-h-10 max-w-full shrink-0 items-center gap-2 rounded-full border border-zinc-700/85 bg-zinc-900/55 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800/70 hover:text-zinc-100 sm:px-4";

/** Small secondary control (log out, compact actions). */
export const logoutButtonClass =
  "inline-flex min-h-9 shrink-0 items-center rounded-full border border-zinc-600/80 bg-zinc-900/50 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60";

/** Top-left brand link shown in page headers. */
export const brandLinkClass =
  "inline-flex min-h-10 items-center rounded-full px-2 text-sm font-semibold tracking-tight text-zinc-100 transition hover:text-orange-200 sm:px-3";
