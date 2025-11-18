import { useMemo, useState, useEffect, useCallback } from "react";
import { Modal, Button } from "@/components";
import ProductColorsSection from "@/components/organisms/ProductColorsSection";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import type { Product, ColorWithName, ProductColor } from "@/types";
import { cn, toTitleCase } from "@/utils";
import { ChevronLeft, ChevronRight, Box } from "lucide-react";
import {
  PREDEFINED_COLORS,
  getColorByCode,
  getColorByName,
  normalizeColorName,
} from "@/constants";

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
  const { addItem, items } = useCart();
  const { toast } = useToast();
  const baseImages = useMemo(
    () => (product.image.length > 0 ? product.image : [""]),
    [product.image]
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  const [selectedColorIndices, setSelectedColorIndices] = useState<number[]>([]);
  const [showingModel3D, setShowingModel3D] = useState(false);
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
      const position = Math.min(Math.max(0, product.model3DGridPosition), items.length);
      items.splice(position, 0, "__MODEL_3D__");
    }
    
    return items;
  }, [displayImages, product.model3DUrl, product.model3DGridPosition]);

  const hasMultipleImages = galleryItems.length > 1;

  const normalizedColors = useMemo<ColorWithName[]>(() => {
    const mapped =
      product.availableColors?.map((color) => {
        const matchedColor =
          getColorByName(color.name) ?? getColorByCode(color.code);

        return {
          ...color,
          code: matchedColor?.code ?? color.code,
          name: matchedColor?.name ?? toTitleCase(color.name || color.code),
        };
      }) ?? [];

    const existingNames = new Set(
      mapped.map((color) => normalizeColorName(color.name))
    );

    PREDEFINED_COLORS.forEach((predefined) => {
      const normalizedName = normalizeColorName(predefined.name);
      if (!existingNames.has(normalizedName)) {
        mapped.push({
          name: predefined.name,
          code: predefined.code,
        });
        existingNames.add(normalizedName);
      }
    });

    return mapped;
  }, [product.availableColors]);

  useEffect(() => {
    setDisplayImages(baseImages);
    setCurrentImageIndex(0);
    setSelectedColorIndex(null);
    setSelectedColorIndices([]);
    setShowingModel3D(false);
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

      fetch(product.model3DUrl, { method: "HEAD" })
        .then(() => {
          setModel3DPreloaded(true);
        })
        .catch(() => {
          setModel3DPreloaded(false);
        })
        .finally(() => {
          if (document.head.contains(preloadLink)) {
            document.head.removeChild(preloadLink);
          }
        });

      return () => {
        if (document.head.contains(preloadLink)) {
          document.head.removeChild(preloadLink);
        }
      };
    }
  }, [isOpen, product.model3DUrl, model3DPreloaded]);

  const resolveImageIndex = useCallback(
    (color: ColorWithName): number | null => {
      if (
        typeof color.imageIndex === "number" &&
        displayImages[color.imageIndex]
      ) {
        return color.imageIndex;
      }

      if (color.image) {
        const matchedIndex = displayImages.findIndex(
          (image) => image === color.image
        );
        if (matchedIndex !== -1) {
          return matchedIndex;
        }
      }

      return null;
    },
    [displayImages]
  );

  const getColorIndexByImageIndex = useCallback(
    (imageIndex: number): number | null => {
      const match = normalizedColors.findIndex(
        (color) => resolveImageIndex(color) === imageIndex
      );
      return match >= 0 ? match : null;
    },
    [normalizedColors, resolveImageIndex]
  );

  useEffect(() => {
    const matchedIndex = getColorIndexByImageIndex(currentImageIndex);
    setSelectedColorIndex(matchedIndex);
  }, [currentImageIndex, getColorIndexByImageIndex]);

  const handlePreviousImage = () => {
    setShowingModel3D(() => {
      const newIndex = showingModel3D ? galleryItems.length - 1 : currentImageIndex - 1;
      
      if (newIndex < 0) {
        const lastItem = galleryItems[galleryItems.length - 1];
        if (lastItem === "__MODEL_3D__") {
          return true;
        }
        setCurrentImageIndex(displayImages.length - 1);
        return false;
      }
      
      if (galleryItems[newIndex] === "__MODEL_3D__") {
        return true;
      }
      
      const imageIndex = displayImages.indexOf(galleryItems[newIndex] as string);
      setCurrentImageIndex(imageIndex >= 0 ? imageIndex : 0);
      return false;
    });
  };

  const handleNextImage = () => {
    setShowingModel3D(() => {
      const currentGalleryIndex = showingModel3D 
        ? galleryItems.indexOf("__MODEL_3D__")
        : galleryItems.findIndex((item) => {
            if (item === "__MODEL_3D__") return false;
            return displayImages.indexOf(item as string) === currentImageIndex;
          });
      
      const nextIndex = (currentGalleryIndex + 1) % galleryItems.length;
      
      if (galleryItems[nextIndex] === "__MODEL_3D__") {
        return true;
      }
      
      const imageIndex = displayImages.indexOf(galleryItems[nextIndex] as string);
      setCurrentImageIndex(imageIndex >= 0 ? imageIndex : 0);
      return false;
    });
  };

  const handleGalleryItemClick = (item: string) => {
    if (item === "__MODEL_3D__") {
      setShowingModel3D(true);
    } else {
      setShowingModel3D(false);
      const imageIndex = displayImages.indexOf(item);
      if (imageIndex >= 0) {
        setCurrentImageIndex(imageIndex);
      }
    }
  };

  const handleColorSelect = useCallback(
    (colorIndex: number) => {
      setSelectedColorIndex(colorIndex);
      const color = normalizedColors[colorIndex];
      if (!color) {
        return;
      }

      const imageIndex = resolveImageIndex(color);
      if (imageIndex !== null) {
        setCurrentImageIndex(imageIndex);
      }
    },
    [normalizedColors, resolveImageIndex]
  );

  const productColors: ProductColor[] = useMemo(
    () =>
      normalizedColors.map((color, index) => ({
        id: `${product.id}-color-${index}`,
        name: color.name,
        hex: color.code,
        available: true,
      })),
    [normalizedColors, product.id]
  );

  const handleColorChangeFromSelector = useCallback(
    (colorId: string) => {
      const colorIndex = parseInt(colorId.split("-").pop() || "0", 10);
      handleColorSelect(colorIndex);
    },
    [handleColorSelect]
  );

  const handleColorsChangeFromSelector = useCallback(
    (colorIds: string[]) => {
      const indices = colorIds.map((colorId) => 
        parseInt(colorId.split("-").pop() || "0", 10)
      );
      setSelectedColorIndices(indices);
      if (indices.length > 0) {
        const firstIndex = indices[0];
        handleColorSelect(firstIndex);
      }
    },
    [handleColorSelect]
  );

  const handleAddToCart = () => {
    if (selectedColorIndices.length === 0 && selectedColorIndex === null) {
      toast.error("Por favor selecciona al menos un color.");
      return;
    }

    const colorsToAdd = selectedColorIndices.length > 0
      ? selectedColorIndices.map((index) => normalizedColors[index]).filter(Boolean)
      : selectedColorIndex !== null
      ? [normalizedColors[selectedColorIndex]]
      : [];

    if (colorsToAdd.length === 0) {
      toast.error("No se pudo agregar el producto. Intenta nuevamente.");
      return;
    }

    const wasAdded = addItem(product, 1, colorsToAdd);

    if (wasAdded) {
      const colorText = colorsToAdd.length === 1
        ? ` (${colorsToAdd[0].name})`
        : ` (${colorsToAdd.length} colores: ${colorsToAdd.map(c => c.name).join(", ")})`;
      toast.success(`${product.name}${colorText} añadido al carrito.`);
      onClose();
    } else {
      toast.error(`No queda más stock de ${product.name}.`);
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
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[var(--color-toad-eyes)] bg-white text-[var(--color-toad-eyes)] transition-all cursor-pointer hover:bg-[var(--color-toad-eyes)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toad-eyes)]"
            aria-label="Cerrar modal"
          >
            <span className="text-xl font-bold leading-none">×</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-3xl border-4 border-[var(--color-border-base)] group bg-white">
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
                    {showingModel3D ? "Modelo 3D" : `${currentImageIndex + 1} / ${displayImages.length}`}
                  </div>
                </>
              )}
            </div>
            {hasMultipleImages && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {galleryItems.map((item, index) => {
                  const isModel3D = item === "__MODEL_3D__";
                  const isActive = isModel3D 
                    ? showingModel3D 
                    : !showingModel3D && displayImages.indexOf(item as string) === currentImageIndex;

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
                      ) : (
                        <img
                          src={item as string || ""}
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

          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3
                id="product-title"
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-border-base)] mb-3"
                style={{ fontFamily: "var(--font-baloo)" }}
              >
                {product.name}
              </h3>
              <p
                className="text-2xl sm:text-3xl font-semibold text-[var(--color-toad-eyes)]"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                ${product.price.toLocaleString("es-ES")}
              </p>
            </div>

            <p
              className="text-base text-[var(--color-border-base)]/85"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              {product.description}
            </p>

            {renderField("Tipo de Plástico", product.plasticType)}
            {renderField("Tiempo de Impresión", product.printTime)}

            {productColors.length > 0 && (
              <ProductColorsSection
                productId={product.id}
                colors={productColors}
                onColorChange={handleColorChangeFromSelector}
                onColorsChange={handleColorsChangeFromSelector}
                multiple={true}
              />
            )}

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 pt-4">
              <Button
                onClick={handleAddToCart}
                variant="primary"
                className="flex-1 !px-4 !py-2 !text-base hover:bg-[var(--color-frog-green)] hover:border-[var(--color-frog-green)] hover:text-[var(--color-contrast-base)]"
                disabled={selectedColorIndices.length === 0 && selectedColorIndex === null}
              >
                {selectedColorIndices.length > 0
                  ? `Agregar ${selectedColorIndices.length} color${selectedColorIndices.length === 1 ? "" : "es"} al Carrito`
                  : "Agregar al Carrito"}
              </Button>
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
