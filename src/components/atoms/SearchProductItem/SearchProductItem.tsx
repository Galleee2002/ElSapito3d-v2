import { cn } from "@/utils";
import type { Product } from "@/types";

interface SearchProductItemProps {
  product: Product;
  onClick?: () => void;
  className?: string;
}

const SearchProductItem = ({ product, onClick, className }: SearchProductItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-[var(--radius-md)] transition-colors",
        "hover:bg-white/10 focus:bg-white/10 focus:outline-none",
        "text-left",
        className
      )}
      aria-label={`Ver producto ${product.name}`}
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-[var(--radius-sm)] object-cover shrink-0"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm sm:text-base font-medium text-white truncate">
          {product.name}
        </h4>
        <p className="text-xs sm:text-sm text-white/70 line-clamp-1">
          {product.description}
        </p>
        <span className="text-xs sm:text-sm font-bold text-white/90 mt-0.5">
          ${product.price.toLocaleString()}
        </span>
      </div>
    </button>
  );
};

export default SearchProductItem;

