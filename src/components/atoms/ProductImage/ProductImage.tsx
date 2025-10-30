import { cn } from "@/utils/cn";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

const ProductImage = ({ src, alt, className }: ProductImageProps) => {
  return (
    <div className={cn("relative w-full aspect-square overflow-hidden rounded-t-[var(--radius-md)]", className)}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
    </div>
  );
};

export default ProductImage;

