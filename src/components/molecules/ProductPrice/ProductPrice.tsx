import { cn } from "@/utils";

interface ProductPriceProps {
  price: number;
  promotionPrice?: number;
  className?: string;
}

const ProductPrice = ({
  price,
  promotionPrice,
  className,
}: ProductPriceProps) => {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {promotionPrice ? (
        <>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)]">
              ${promotionPrice.toLocaleString()}
            </span>
            <span className="text-xs sm:text-sm text-[var(--color-text)] opacity-60 line-through">
              ${price.toLocaleString()}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-[var(--color-primary)] font-medium">
            Precio por transferencia{" "}
          </span>
        </>
      ) : (
        <span className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)]">
          ${price.toLocaleString()}
        </span>
      )}
    </div>
  );
};

export default ProductPrice;
