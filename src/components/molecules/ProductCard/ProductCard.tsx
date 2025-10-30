import { cn } from "@/utils/cn";
import ProductImage from "../../atoms/ProductImage";
import type { Product } from "@/types/product.types";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
}

const ProductCard = ({ product, onClick, className, size = "md" }: ProductCardProps) => {
  return (
    <article
      className={cn(
        // Superficie sin sombra externa para evitar separación visual entre contenedores
        "bg-[var(--color-surface)] rounded-[var(--radius-md)] cursor-pointer group",
        // Anillo sutil que reemplaza la sombra y no desborda
        "ring-1 ring-black/5 hover:ring-black/10 transition-colors duration-300",
        // Accesibilidad foco
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
        className
      )}
      onClick={onClick}
    >
      <ProductImage src={product.image} alt={product.name} />
      
      <div className={cn(size === "sm" ? "p-3 sm:p-4" : "p-4 sm:p-5 md:p-6")}> 
        <h3 className={cn(
          "text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors duration-300",
          size === "sm" ? "text-base sm:text-lg mb-1.5 sm:mb-2" : "text-lg sm:text-xl mb-2 sm:mb-3"
        )}>
          {product.name}
        </h3>
        <p className={cn("text-[var(--color-text)] opacity-70 line-clamp-2",
          size === "sm" ? "text-xs sm:text-sm mb-2 sm:mb-3" : "text-sm mb-3 sm:mb-4"
        )}>
          {product.description}
        </p>
        <span className={cn("font-bold text-[var(--color-primary)]",
          size === "sm" ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
        )}>
          ${product.price.toLocaleString()}
        </span>
      </div>
    </article>
  );
};

export default ProductCard;

