import { cn } from "@/utils";

interface ProductCardSkeletonProps {
  className?: string;
  size?: "sm" | "md";
}

const ProductCardSkeleton = ({
  className,
  size = "md",
}: ProductCardSkeletonProps) => {
  return (
    <article
      className={cn(
        "bg-(--color-surface) rounded-md",
        "ring-1 ring-black/5",
        className
      )}
    >
      <div className="relative w-full aspect-square bg-gray-200 animate-pulse rounded-t-md" />

      <div className={cn(size === "sm" ? "p-3 sm:p-4" : "p-4 sm:p-5 md:p-6")}>
        <div
          className={cn(
            "bg-gray-200 animate-pulse rounded",
            size === "sm"
              ? "h-5 sm:h-6 mb-1.5 sm:mb-2 w-3/4"
              : "h-6 sm:h-7 mb-2 sm:mb-3 w-2/3"
          )}
        />

        <div className="space-y-2 mb-2 sm:mb-3">
          <div
            className={cn(
              "bg-gray-200 animate-pulse rounded",
              size === "sm" ? "h-3 sm:h-4 w-full" : "h-4 sm:h-5 w-full"
            )}
          />
          <div
            className={cn(
              "bg-gray-200 animate-pulse rounded",
              size === "sm" ? "h-3 sm:h-4 w-5/6" : "h-4 sm:h-5 w-4/5"
            )}
          />
        </div>

        <div
          className={cn(
            "bg-gray-200 animate-pulse rounded",
            size === "sm"
              ? "h-5 sm:h-6 w-20 sm:w-24"
              : "h-6 sm:h-7 w-24 sm:w-32"
          )}
        />
      </div>
    </article>
  );
};

export default ProductCardSkeleton;
