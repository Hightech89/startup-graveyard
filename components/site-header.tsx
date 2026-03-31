import { AuthStatus } from "@/components/auth-status";
import { BrandLink } from "@/components/brand-link";

/**
 * Global top navigation row (brand left, account controls right).
 * Keep page-specific navigation (e.g. back links) outside this row.
 */
export function SiteHeader() {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 sm:gap-3">
      <BrandLink />
      <AuthStatus />
    </div>
  );
}

