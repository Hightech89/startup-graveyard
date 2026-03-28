type SkeletonBoxProps = {
  className?: string;
};

/** Dark themed animated bar; use for layout blocks. */
export function SkeletonBox({ className = "" }: SkeletonBoxProps) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      aria-hidden
    />
  );
}
