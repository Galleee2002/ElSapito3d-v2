import { memo } from "react";
import { cn } from "@/utils";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

const ProductImage = memo(({ src, alt, className }: ProductImageProps) => {
  return (
    <div className={cn("relative w-full aspect-square overflow-hidden rounded-t-[var(--radius-md)]", className)}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
});

ProductImage.displayName = "ProductImage";

export default ProductImage;

