import { SkeletonBox } from "@/components/skeleton-primitives";

/** Approximates Profile + Log out row and email line to reduce header layout shift. */
export function AuthHeaderSkeleton() {
  return (
    <div
      className="flex min-w-0 max-w-full flex-col items-end gap-1.5 sm:gap-2"
      aria-hidden
    >
      <div className="flex flex-wrap items-center justify-end gap-2">
        <SkeletonBox className="h-10 w-[5.75rem] max-w-full rounded-full" />
        <SkeletonBox className="h-9 w-[4.25rem] max-w-full rounded-full" />
      </div>
      <SkeletonBox className="h-3 w-36 max-w-full rounded-md sm:w-44" />
    </div>
  );
}
