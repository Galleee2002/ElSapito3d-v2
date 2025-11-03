import { useRef, useEffect } from "react";
import { cn } from "@/utils";
import { SearchProductItem } from "@/components";
import type { Product } from "@/types";

interface SearchResultsDropdownProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onClose?: () => void;
  className?: string;
}

const SearchResultsDropdown = ({
  products,
  onProductClick,
  onClose,
  className,
}: SearchResultsDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (products.length === 0) return null;

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "absolute top-full left-0 right-0 mt-2",
        "bg-[var(--color-primary)]/95 rounded-[var(--radius-lg)]",
        "shadow-[var(--shadow-lg)] border border-white/10",
        "max-h-[400px] overflow-y-auto",
        "scrollbar-hide",
        "z-50",
        className
      )}
    >
      <div className="p-2">
        {products.map((product) => (
          <SearchProductItem
            key={product.id}
            product={product}
            onClick={() => onProductClick(product)}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResultsDropdown;

