import { AuthHeaderSkeleton } from "@/components/auth-header-skeleton";
import { BackNavLink } from "@/components/back-nav-link";
import { ProfileContentSkeleton } from "@/components/page-skeletons";
import { SkeletonBox } from "@/components/skeleton-primitives";

const headerClass =
  "border-b border-zinc-800/90 bg-[radial-gradient(70%_140%_at_50%_0%,rgba(249,115,22,0.12),rgba(24,24,27,0.88)_42%,#09090b_72%)]";

export default function Loading() {
  return (
    <div className="min-h-full bg-zinc-950 text-zinc-50">
      <header className={headerClass}>
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-center justify-between gap-4">
            <BackNavLink href="/">Back to graveyard</BackNavLink>
            <AuthHeaderSkeleton />
          </div>
          <div className="mt-6 space-y-2" aria-hidden>
            <SkeletonBox className="h-9 w-40 rounded-lg sm:h-10" />
            <SkeletonBox className="h-4 max-w-xl rounded-md" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <ProfileContentSkeleton />
      </main>
    </div>
  );
}
