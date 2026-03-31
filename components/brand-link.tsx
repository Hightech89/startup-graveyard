import Link from "next/link";
import { brandLinkClass } from "@/components/nav-actions";

type BrandLinkProps = {
  className?: string;
};

export function BrandLink({ className = "" }: BrandLinkProps) {
  return (
    <Link
      href="/"
      className={[brandLinkClass, className].filter(Boolean).join(" ")}
      aria-label="Startup Graveyard home"
    >
      Startup Graveyard
    </Link>
  );
}

