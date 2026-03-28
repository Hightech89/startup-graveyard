import { AuthHeaderSkeleton } from "@/components/auth-header-skeleton";
import { SkeletonBox } from "@/components/skeleton-primitives";

const homeHeaderClass =
  "border-b border-zinc-800/90 bg-[radial-gradient(70%_140%_at_50%_0%,rgba(249,115,22,0.16),rgba(24,24,27,0.88)_42%,#09090b_72%)]";

const detailHeaderClass =
  "border-b border-zinc-800/90 bg-[radial-gradient(70%_140%_at_50%_0%,rgba(249,115,22,0.12),rgba(24,24,27,0.88)_42%,#09090b_72%)]";

export function StartupCardSkeleton() {
  return (
    <article
      className="rounded-[1.2rem] border border-zinc-800 bg-zinc-900/85 p-6 [border-top-left-radius:2rem] [border-top-right-radius:2rem]"
      aria-hidden
    >
      <div className="space-y-6">
        <div className="space-y-2.5">
          <SkeletonBox className="h-7 w-[min(70%,16rem)] rounded-lg" />
          <SkeletonBox className="h-4 w-full max-w-md rounded-md" />
          <SkeletonBox className="h-4 w-[92%] max-w-sm rounded-md" />
        </div>
        <div className="space-y-2.5">
          <SkeletonBox className="h-3 w-28 rounded-md" />
          <SkeletonBox className="h-[4.5rem] w-full rounded-xl" />
        </div>
        <div className="border-l-2 border-zinc-800 py-3.5 pl-4 sm:pl-5">
          <SkeletonBox className="h-3 w-24 rounded-md" />
          <SkeletonBox className="mt-3 h-4 w-full rounded-md" />
          <SkeletonBox className="mt-2 h-4 w-[88%] rounded-md" />
        </div>
        <div className="flex flex-col gap-4 border-t border-zinc-800/90 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            <SkeletonBox className="h-7 w-14 rounded-md" />
            <SkeletonBox className="h-7 w-16 rounded-md" />
            <SkeletonBox className="h-7 w-12 rounded-md" />
          </div>
          <SkeletonBox className="h-8 w-14 shrink-0 self-end rounded-md sm:self-auto" />
        </div>
      </div>
    </article>
  );
}

export function CommentsListSkeleton() {
  return (
    <div className="space-y-0 divide-y divide-zinc-800/90" aria-hidden>
      <div className="space-y-2 py-4 first:pt-0">
        <SkeletonBox className="h-4 w-full rounded-md" />
        <SkeletonBox className="h-4 w-[88%] rounded-md" />
        <SkeletonBox className="mt-2 h-3 w-44 rounded-md" />
      </div>
      <div className="space-y-2 py-4">
        <SkeletonBox className="h-4 w-full rounded-md" />
        <SkeletonBox className="h-4 w-[72%] rounded-md" />
        <SkeletonBox className="mt-2 h-3 w-36 rounded-md" />
      </div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="min-h-full bg-zinc-950 text-zinc-50">
      <header className={homeHeaderClass}>
        <div className="mx-auto max-w-5xl px-4 py-18 sm:px-6 sm:py-24">
          <div className="mb-8 flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <AuthHeaderSkeleton />
          </div>
          <div className="text-center">
            <div className="relative inline-block">
              <SkeletonBox className="mx-auto h-10 w-56 rounded-lg sm:h-12 sm:w-72" />
            </div>
            <SkeletonBox className="mx-auto mt-4 h-6 max-w-2xl rounded-lg" />
            <SkeletonBox className="mx-auto mt-3 h-6 max-w-xl rounded-lg opacity-80" />
            <div className="mt-5 flex justify-center px-1">
              <SkeletonBox className="h-10 w-44 rounded-full" />
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <SkeletonBox className="h-12 w-full rounded-xl" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <SkeletonBox className="h-4 w-14 rounded-md" />
                <SkeletonBox className="h-7 w-16 rounded-full" />
                <SkeletonBox className="h-7 w-20 rounded-full" />
                <SkeletonBox className="h-7 w-14 rounded-full" />
              </div>
              <div className="flex items-center gap-3 sm:justify-end">
                <SkeletonBox className="h-4 w-10 rounded-md" />
                <SkeletonBox className="h-10 w-36 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <SkeletonBox className="h-6 w-36 rounded-md" />
          <SkeletonBox className="h-4 w-24 rounded-md" />
        </div>
        <ul className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i}>
              <StartupCardSkeleton />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export function StartupDetailPageSkeleton() {
  return (
    <div className="min-h-full bg-zinc-950 text-zinc-50">
      <header className={detailHeaderClass}>
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-center justify-between gap-4">
            <SkeletonBox className="h-5 w-40 rounded-md" />
            <AuthHeaderSkeleton />
          </div>
          <SkeletonBox className="mt-6 h-9 w-32 rounded-lg sm:h-10" />
          <SkeletonBox className="mt-2 h-4 max-w-xl rounded-md" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <StartupCardSkeleton />
        <div className="mx-auto mt-10 max-w-3xl">
          <CommentsSectionSkeleton />
        </div>
      </main>
    </div>
  );
}

export function CommentsSectionSkeleton() {
  return (
    <section
      className="mt-10 rounded-[1.2rem] border border-zinc-700 bg-zinc-900/85 p-5 shadow-[0_14px_30px_-18px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.02)]"
      aria-hidden
    >
      <SkeletonBox className="h-6 w-28 rounded-md" />
      <div className="mt-6">
        <CommentsListSkeleton />
      </div>
      <div className="mt-8 border-t border-zinc-700 pt-6">
        <SkeletonBox className="h-4 w-32 rounded-md" />
        <SkeletonBox className="mt-2 h-24 w-full rounded-xl" />
        <SkeletonBox className="mt-4 h-10 w-32 rounded-xl" />
      </div>
    </section>
  );
}

/** Profile main content while session is resolving. */
export function ProfileContentSkeleton() {
  return (
    <div className="space-y-10" aria-hidden>
      <div>
        <SkeletonBox className="h-3 w-12 rounded-md" />
        <SkeletonBox className="mt-2 h-6 w-64 max-w-full rounded-md" />
      </div>
      <ProfileSubmissionsSkeleton />
    </div>
  );
}

export function ProfileSubmissionsGridSkeleton() {
  return (
    <ul
      className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2"
      aria-hidden
    >
      {Array.from({ length: 2 }, (_, i) => (
        <li key={i}>
          <StartupCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

export function ProfileSubmissionsSkeleton() {
  return (
    <div aria-hidden>
      <SkeletonBox className="h-6 w-40 rounded-md" />
      <div className="mt-6">
        <ProfileSubmissionsGridSkeleton />
      </div>
    </div>
  );
}
