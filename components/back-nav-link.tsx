import Link from "next/link";
import type { ReactNode } from "react";
import { backNavLinkClass } from "@/components/nav-actions";

type BackNavLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export function BackNavLink({ href, children, className = "" }: BackNavLinkProps) {
  return (
    <Link href={href} className={[backNavLinkClass, className].filter(Boolean).join(" ")}>
      <svg
        className="size-4 shrink-0 text-zinc-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span className="min-w-0 truncate">{children}</span>
    </Link>
  );
}
