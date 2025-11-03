import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Video, Image as ImageIcon } from "lucide-react";
import { cn } from "@/utils";

interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface ProductImageSliderProps {
  images: string[];
  videos?: string[];
  productName: string;
  className?: string;
}

const ProductImageSlider = ({ images, videos = [], productName, className }: ProductImageSliderProps) => {
  const mediaItems: MediaItem[] = useMemo(() => {
    const items: MediaItem[] = images.map((url) => ({ url, type: "image" as const }));
    const videoItems: MediaItem[] = videos.map((url) => ({ url, type: "video" as const }));
    return [...items, ...videoItems];
  }, [images, videos]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1 === mediaItems.length ? 0 : prev + 1));
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 < 0 ? mediaItems.length - 1 : prev - 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const currentMedia = mediaItems[currentIndex];

  if (mediaItems.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <div className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] mb-4 bg-black/5 flex items-center justify-center">
          <p className="text-[var(--color-text)]/50">Sin medios disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] mb-4 bg-black/5">
        {currentMedia.type === "video" ? (
          <video
            src={currentMedia.url}
            controls
            className="w-full h-full object-cover"
          >
            Tu navegador no soporta videos.
          </video>
        ) : (
          <img
            src={currentMedia.url}
            alt={`${productName} - Vista ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {mediaItems.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={24} className="text-[var(--color-text)]" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight size={24} className="text-[var(--color-text)]" />
            </button>
          </>
        )}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
          {currentMedia.type === "video" && <Video size={12} />}
          {currentMedia.type === "image" && <ImageIcon size={12} />}
          {currentIndex + 1} / {mediaItems.length}
        </div>
      </div>
      {mediaItems.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {mediaItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                "aspect-square overflow-hidden rounded-[var(--radius-sm)] ring-2 transition-all relative",
                currentIndex === index
                  ? "ring-[var(--color-primary)] opacity-100"
                  : "ring-transparent opacity-60 hover:opacity-100"
              )}
            >
              {item.type === "video" ? (
                <>
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Video size={16} className="text-white" />
                  </div>
                </>
              ) : (
                <img
                  src={item.url}
                  alt={`${productName} - Miniatura ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageSlider;

