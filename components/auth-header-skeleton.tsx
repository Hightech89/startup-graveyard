import { SkeletonBox } from "@/components/skeleton-primitives";

/** Matches secondary nav pill size to reduce header layout shift. */
export function AuthHeaderSkeleton() {
  return (
    <div
      className="flex h-10 min-h-10 items-center justify-end sm:min-w-[9rem]"
      aria-hidden
    >
      <SkeletonBox className="h-10 w-[9.5rem] max-w-full rounded-full" />
    </div>
  );
}
