import { useMemo, useState, useEffect, useCallback } from "react";
import { Modal, Button } from "@/components";
import ProductColorsSection from "@/components/organisms/ProductColorsSection";
import { useCart, useToast } from "@/hooks";
import type { Product, ColorWithName, ProductColor } from "@/types";
import { cn, toTitleCase } from "@/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const { addItem, getItemQuantity } = useCart();
  const { showSuccess, showError } = useToast();
  const baseImages = useMemo(
    () => (product.image.length > 0 ? product.image : [""]),
    [product.image]
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);

  const quantityInCart = getItemQuantity(product.id);
  const remainingStock = useMemo(
    () => Math.max(product.stock - quantityInCart, 0),
    [product.stock, quantityInCart]
  );
  const isOutOfStock = remainingStock === 0;

  const [displayImages, setDisplayImages] = useState(baseImages);
  const hasMultipleImages = displayImages.length > 1;

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
  }, [baseImages, product.id, isOpen]);

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
    setCurrentImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
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

  const handleAddToCart = () => {
    const selectedColor = selectedColorIndex !== null ? normalizedColors[selectedColorIndex] : undefined;
    const wasAdded = addItem(product, 1, selectedColor);
    if (wasAdded) {
      const colorText = selectedColor ? ` (${selectedColor.name})` : '';
      showSuccess(`${product.name}${colorText} añadido al carrito.`);
      onClose();
    } else {
      showError(`No queda más stock de ${product.name}.`);
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
            className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[var(--color-border-base)] bg-white text-[var(--color-border-base)] transition-all cursor-pointer hover:bg-[var(--color-border-base)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-base)]"
            aria-label="Cerrar modal"
          >
            <span className="text-xl font-bold leading-none">×</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-3xl border-4 border-[var(--color-border-base)] group bg-white">
              {product.model3DUrl ? (
                <model-viewer
                  src={product.model3DUrl}
                  poster={displayImages[currentImageIndex] || ""}
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
                    {currentImageIndex + 1} / {displayImages.length}
                  </div>
                </>
              )}
            </div>
            {hasMultipleImages && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {displayImages.map((image, index) => (
                  <div
                    key={index}
                    className={cn(
                      "aspect-square overflow-hidden rounded-lg border-2 transition-all",
                      index === currentImageIndex
                        ? "border-[var(--color-border-base)] ring-2 ring-[var(--color-border-base)]"
                        : "border-gray-300"
                    )}
                  >
                    <img
                      src={image || ""}
                      alt={`${product.name} - Vista ${index + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
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
              />
            )}

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 pt-4">
              <Button
                onClick={handleAddToCart}
                variant="primary"
                className="flex-1 !px-4 !py-2 !text-base"
              >
                Agregar al Carrito
              </Button>
              <Button
                onClick={onClose}
                variant="secondary"
                className="flex-1 !px-4 !py-2 !text-base"
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
