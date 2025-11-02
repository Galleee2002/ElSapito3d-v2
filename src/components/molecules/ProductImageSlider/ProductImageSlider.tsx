import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils";

interface ProductImageSliderProps {
  images: string[];
  productName: string;
  className?: string;
}

const ProductImageSlider = ({ images, productName, className }: ProductImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1 === images.length ? 0 : prev + 1));
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 < 0 ? images.length - 1 : prev - 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] mb-4 bg-black/5">
        <img
          src={images[currentIndex]}
          alt={`${productName} - Vista ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={24} className="text-[var(--color-text)]" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={24} className="text-[var(--color-text)]" />
            </button>
          </>
        )}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                "aspect-square overflow-hidden rounded-[var(--radius-sm)] ring-2 transition-all",
                currentIndex === index
                  ? "ring-[var(--color-primary)] opacity-100"
                  : "ring-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img
                src={image}
                alt={`${productName} - Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageSlider;

