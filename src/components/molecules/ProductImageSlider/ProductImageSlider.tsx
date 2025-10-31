import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowButton } from "@/components/atoms";
import { cn } from "@/utils/cn";

interface ProductImageSliderProps {
  images: string[];
  onClose: () => void;
  className?: string;
}

const ProductImageSlider = ({ images, onClose, className }: ProductImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1 === images.length ? 0 : prevIndex + 1));
  }, [images.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 < 0 ? images.length - 1 : prevIndex - 1));
  }, [images.length]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowRight") {
        handleNext();
      } else if (event.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const interval = setInterval(() => {
      if (images.length > 1) {
        handleNext();
      }
    }, 5000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(interval);
    };
  }, [images.length, handleNext, handlePrevious, onClose]);

  return (
    <div className={cn("relative w-full h-full bg-[var(--color-surface)] flex flex-col", className)}>
      <div className="relative w-full flex-1 overflow-hidden flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Imagen ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="max-w-full max-h-full object-contain"
            loading="eager"
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <ArrowButton
              direction="left"
              onClick={handlePrevious}
              aria-label="Imagen anterior"
            />
            <ArrowButton
              direction="right"
              onClick={handleNext}
              aria-label="Imagen siguiente"
            />
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 py-3 px-4 shrink-0">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleDotClick(index)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-200",
                currentIndex === index
                  ? "bg-[var(--color-primary)] w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageSlider;

