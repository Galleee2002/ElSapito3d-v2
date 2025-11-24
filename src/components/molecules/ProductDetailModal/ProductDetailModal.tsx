import { useMemo, useState, useEffect } from "react";
import { Modal, Button } from "@/components";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types";
import { cn, calculateDiscountPercentage } from "@/utils";
import { ChevronLeft, ChevronRight, Box } from "lucide-react";

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal = ({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) => {
  const { items } = useCart();
  const baseImages = useMemo(
    () => (product.image.length > 0 ? product.image : [""]),
    [product.image]
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showingModel3D, setShowingModel3D] = useState(false);
  const [showingVideo, setShowingVideo] = useState(false);
  const [model3DPreloaded, setModel3DPreloaded] = useState(false);

  const quantityInCart = useMemo(() => {
    return items.reduce((total, item) => {
      if (item.product.id === product.id) {
        return total + item.quantity;
      }
      return total;
    }, 0);
  }, [items, product.id]);

  const remainingStock = useMemo(
    () => Math.max(product.stock - quantityInCart, 0),
    [product.stock, quantityInCart]
  );
  const isOutOfStock = remainingStock === 0;

  const [displayImages, setDisplayImages] = useState(baseImages);

  const galleryItems = useMemo(() => {
    const items = [...displayImages];

    if (product.model3DUrl && product.model3DGridPosition !== undefined) {
      const position = Math.min(
        Math.max(0, product.model3DGridPosition),
        items.length
      );
      items.splice(position, 0, "__MODEL_3D__");
    }

    if (product.videoUrl) {
      items.push("__VIDEO__");
    }

    return items;
  }, [
    displayImages,
    product.model3DUrl,
    product.model3DGridPosition,
    product.videoUrl,
  ]);

  const hasMultipleImages = galleryItems.length > 1;

  useEffect(() => {
    setDisplayImages(baseImages);
    setCurrentImageIndex(0);
    setShowingModel3D(false);
    setShowingVideo(false);
    setModel3DPreloaded(false);
  }, [baseImages, product.id, isOpen]);

  useEffect(() => {
    if (isOpen && product.model3DUrl && !model3DPreloaded) {
      const preloadLink = document.createElement("link");
      preloadLink.rel = "preload";
      preloadLink.as = "fetch";
      preloadLink.href = product.model3DUrl;
      preloadLink.crossOrigin = "anonymous";
      document.head.appendChild(preloadLink);

      setModel3DPreloaded(true);

      return () => {
        if (document.head.contains(preloadLink)) {
          document.head.removeChild(preloadLink);
        }
      };
    }
  }, [isOpen, product.model3DUrl, model3DPreloaded]);

  const handlePreviousImage = () => {
    const currentGalleryIndex = showingModel3D
      ? galleryItems.indexOf("__MODEL_3D__")
      : showingVideo
      ? galleryItems.indexOf("__VIDEO__")
      : galleryItems.findIndex((item) => {
          if (item === "__MODEL_3D__" || item === "__VIDEO__") return false;
          return displayImages.indexOf(item as string) === currentImageIndex;
        });

    const newIndex =
      currentGalleryIndex - 1 < 0
        ? galleryItems.length - 1
        : currentGalleryIndex - 1;
    const newItem = galleryItems[newIndex];

    if (newItem === "__MODEL_3D__") {
      setShowingModel3D(true);
      setShowingVideo(false);
    } else if (newItem === "__VIDEO__") {
      setShowingVideo(true);
      setShowingModel3D(false);
    } else {
      setShowingModel3D(false);
      setShowingVideo(false);
      const imageIndex = displayImages.indexOf(newItem as string);
      setCurrentImageIndex(imageIndex >= 0 ? imageIndex : 0);
    }
  };

  const handleNextImage = () => {
    const currentGalleryIndex = showingModel3D
      ? galleryItems.indexOf("__MODEL_3D__")
      : showingVideo
      ? galleryItems.indexOf("__VIDEO__")
      : galleryItems.findIndex((item) => {
          if (item === "__MODEL_3D__" || item === "__VIDEO__") return false;
          return displayImages.indexOf(item as string) === currentImageIndex;
        });

    const nextIndex = (currentGalleryIndex + 1) % galleryItems.length;
    const nextItem = galleryItems[nextIndex];

    if (nextItem === "__MODEL_3D__") {
      setShowingModel3D(true);
      setShowingVideo(false);
    } else if (nextItem === "__VIDEO__") {
      setShowingVideo(true);
      setShowingModel3D(false);
    } else {
      setShowingModel3D(false);
      setShowingVideo(false);
      const imageIndex = displayImages.indexOf(nextItem as string);
      setCurrentImageIndex(imageIndex >= 0 ? imageIndex : 0);
    }
  };

  const handleGalleryItemClick = (item: string) => {
    if (item === "__MODEL_3D__") {
      setShowingModel3D(true);
      setShowingVideo(false);
    } else if (item === "__VIDEO__") {
      setShowingVideo(true);
      setShowingModel3D(false);
    } else {
      setShowingModel3D(false);
      setShowingVideo(false);
      const imageIndex = displayImages.indexOf(item);
      if (imageIndex >= 0) {
        setCurrentImageIndex(imageIndex);
      }
    }
  };


  const renderField = (label: string, value: string | undefined) => {
    if (!value) return null;
    return (
      <div>
        <h4
          className="text-lg font-semibold text-[var(--color-border-base)] mb-2"
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          {label}
        </h4>
        <p
          className="text-base text-[var(--color-border-base)]/80"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          {value}
        </p>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy="product-title"
      maxWidth="2xl"
    >
      <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6">
        <div className="flex justify-end flex-shrink-0 mb-4">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[var(--color-toad-eyes)] bg-white text-[var(--color-toad-eyes)] transition-all cursor-pointer hover:bg-[var(--color-toad-eyes)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toad-eyes)]"
            aria-label="Cerrar modal"
          >
            <span className="text-xl font-bold leading-none">×</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="flex flex-col min-h-0 space-y-3">
              <div className="relative aspect-square overflow-hidden rounded-3xl border-4 border-[var(--color-border-base)] group bg-white flex-shrink-0">
                {showingModel3D && product.model3DUrl ? (
                  <model-viewer
                    src={product.model3DUrl}
                    poster={displayImages[0] || ""}
                    alt={product.alt || product.name}
                    ar
                    ar-modes="webxr scene-viewer quick-look"
                    camera-controls
                    auto-rotate
                    rotation-per-second="30deg"
                    exposure="1"
                    environment-image="neutral"
                    shadow-intensity="0.8"
                    field-of-view="45deg"
                    min-field-of-view="25deg"
                    max-field-of-view="65deg"
                    interaction-prompt="auto"
                    touch-action="pan-y"
                    camera-orbit="0deg 75deg auto"
                    min-camera-orbit="auto auto auto"
                    max-camera-orbit="auto auto auto"
                    className="w-full h-full"
                  />
                ) : showingVideo && product.videoUrl ? (
                  <video
                    src={product.videoUrl}
                    poster={displayImages[0] || ""}
                    controls
                    playsInline
                    className="w-full h-full object-contain bg-gray-900"
                    preload="auto"
                    style={{ maxHeight: "100%" }}
                  >
                    <source src={product.videoUrl} type="video/mp4" />
                    Tu navegador no soporta la reproducción de videos.
                  </video>
                ) : (
                  <img
                    src={displayImages[currentImageIndex] || ""}
                    alt={product.alt || product.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                )}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-full border-2 border-[var(--color-border-base)] text-[var(--color-border-base)] transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-full border-2 border-[var(--color-border-base)] text-[var(--color-border-base)] transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-xs z-10">
                      {showingModel3D
                        ? "Modelo 3D"
                        : showingVideo
                        ? "Video"
                        : `${currentImageIndex + 1} / ${displayImages.length}`}
                    </div>
                  </>
                )}
              </div>
              {hasMultipleImages && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 flex-shrink-0">
                  {galleryItems.map((item, index) => {
                    const isModel3D = item === "__MODEL_3D__";
                    const isVideo = item === "__VIDEO__";
                    const isActive = isModel3D
                      ? showingModel3D
                      : isVideo
                      ? showingVideo
                      : !showingModel3D &&
                        !showingVideo &&
                        displayImages.indexOf(item as string) ===
                          currentImageIndex;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleGalleryItemClick(item)}
                        className={cn(
                          "aspect-square overflow-hidden rounded-lg border-2 transition-all cursor-pointer hover:border-[var(--color-border-base)]/50",
                          isActive
                            ? "border-[var(--color-border-base)] ring-2 ring-[var(--color-border-base)]"
                            : "border-gray-300"
                        )}
                      >
                        {isModel3D ? (
                          <div className="h-full w-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                            <Box
                              className="text-[var(--color-border-base)]"
                              size={32}
                              strokeWidth={1.5}
                            />
                          </div>
                        ) : isVideo ? (
                          <div className="h-full w-full bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center relative">
                            <svg
                              className="text-[var(--color-border-base)]"
                              width="32"
                              height="32"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polygon
                                points="5 3 19 12 5 21 5 3"
                                fill="currentColor"
                              />
                            </svg>
                          </div>
                        ) : (
                          <img
                            src={(item as string) || ""}
                            alt={`${product.name} - Vista ${index + 1}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-4 sm:space-y-6">
              <div>
                <h3
                  id="product-title"
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-border-base)] mb-3"
                  style={{ fontFamily: "var(--font-baloo)" }}
                >
                  {product.name}
                </h3>
                <div className="flex flex-col gap-2">
                  {product.originalPrice &&
                  product.originalPrice > product.price ? (
                    <>
                      <div className="flex items-center gap-3">
                        <p
                          className="text-2xl sm:text-3xl font-semibold text-[var(--color-toad-eyes)]"
                          style={{ fontFamily: "var(--font-poppins)" }}
                        >
                          ${product.price.toLocaleString("es-ES")}
                        </p>
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                          -
                          {calculateDiscountPercentage(
                            product.originalPrice,
                            product.price
                          )}
                          %
                        </span>
                      </div>
                      <p
                        className="text-lg sm:text-xl text-[var(--color-border-base)]/60 line-through"
                        style={{ fontFamily: "var(--font-nunito)" }}
                      >
                        ${product.originalPrice.toLocaleString("es-ES")}
                      </p>
                    </>
                  ) : (
                    <p
                      className="text-2xl sm:text-3xl font-semibold text-[var(--color-toad-eyes)]"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      ${product.price.toLocaleString("es-ES")}
                    </p>
                  )}
                </div>
              </div>

              <p
                className="text-base text-[var(--color-border-base)]/85"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                {product.description}
              </p>

              {renderField("Tipo de Plástico", product.plasticType)}
              {renderField("Tiempo de Impresión", product.printTime)}

              {product.accessory && (
                <div>
                  <h4
                    className="text-lg font-semibold text-[var(--color-border-base)] mb-2"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    Accesorio
                  </h4>
                  <p
                    className="text-base text-[var(--color-border-base)]/80"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    {product.accessory.name}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 pt-4">
                <Button
                  onClick={onClose}
                  variant="secondary"
                  className="flex-1 !px-4 !py-2 !text-base hover:bg-[var(--color-toad-eyes)] hover:border-[var(--color-toad-eyes)] hover:text-white"
                >
                  Cerrar
                </Button>
                <p
                  className="basis-full text-sm text-[var(--color-border-base)]/70 text-center sm:text-left sm:mt-2"
                  style={{ fontFamily: "var(--font-nunito)" }}
                  aria-live="polite"
                >
                  {isOutOfStock
                    ? "Este producto no tiene stock disponible actualmente."
                    : `Stock disponible: ${remainingStock} unidad${
                        remainingStock === 1 ? "" : "es"
                      }`}
                </p>
              </div>
            </div>
          </div>
      </div>
    </Modal>
  );
};

export default ProductDetailModal;
