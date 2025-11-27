import { KeyboardEvent, MouseEvent, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Product } from "@/types";
import {
  ProductDetailModal,
  ProductCustomizeModal,
  ProductModelViewer,
  Button,
} from "@/components";
import { motionVariants } from "@/constants";
import { normalizeColorName } from "@/constants";
import { cn, calculateDiscountPercentage, formatCurrency, toSlug } from "@/utils";
import { useColorStore } from "@/hooks";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  editLabel?: string;
  onToggleFeatured?: (product: Product) => void;
}

const ProductCard = ({
  product,
  onEdit,
  editLabel = "Modificar Producto",
  onToggleFeatured,
}: ProductCardProps) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const { colors: storeColors } = useColorStore();

  const colorMode = product.colorMode ?? "default";
  const useColorSections =
    colorMode === "sections" &&
    product.colorSections &&
    product.colorSections.length > 0;

  const personalizableParts = useColorSections
    ? product.colorSections?.length || 0
    : product.availableColors?.length
    ? 1
    : 0;

  const hasColorsDefined = useMemo(() => {
    if (useColorSections) {
      return (
        product.colorSections &&
        product.colorSections.length > 0 &&
        product.colorSections.some(
          (section) => section.availableColorIds.length > 0
        )
      );
    }
    return product.availableColors && product.availableColors.length > 0;
  }, [useColorSections, product.colorSections, product.availableColors]);

  const totalColors = useMemo(() => {
    if (useColorSections) {
      const allColorIds = new Set(
        (product.colorSections ?? []).flatMap(
          (section) => section.availableColorIds
        )
      );

      if (storeColors.length > 0) {
        const availableColorIds = new Set(
          storeColors
            .filter((storeColor) => storeColor.inStock)
            .map((storeColor) => toSlug(storeColor.name))
        );

        return Array.from(allColorIds).filter((colorId) =>
          availableColorIds.has(colorId)
        ).length;
      }

      return allColorIds.size;
    }

    // Si el modo es default y tenemos colores en el store, usamos el store como fuente de verdad
    if (colorMode === "default" && storeColors.length > 0) {
      return storeColors.filter((c) => c.inStock).length;
    }

    if (!product.availableColors || product.availableColors.length === 0) {
      return 0;
    }

    if (storeColors.length > 0) {
      const availableStoreColors = storeColors.filter(
        (storeColor) => storeColor.inStock
      );

      return product.availableColors.filter((productColor) => {
        return availableStoreColors.some(
          (storeColor) =>
            normalizeColorName(storeColor.name) ===
              normalizeColorName(productColor.name || productColor.code) ||
            storeColor.hex.toLowerCase() === productColor.code.toLowerCase()
        );
      }).length;
    }

    return product.availableColors.length;
  }, [useColorSections, product.colorSections, product.availableColors, storeColors]);

  const handleOpenDetails = () => {
    setIsDetailModalOpen(true);
  };

  const handleOpenCustomize = () => {
    setIsCustomizeModalOpen(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenDetails();
    }
  };

  const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onEdit?.(product);
  };

  const handleToggleFeatured = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleFeatured?.(product);
  };

  return (
    <>
      <div className="w-full h-full">
        <div
          role="button"
          tabIndex={0}
          aria-label={`Ver detalles de ${product.name}`}
          onClick={handleOpenDetails}
          onKeyDown={handleKeyDown}
          className={cn(
            "group relative rounded-3xl border-0 sm:border border-border-base/30 bg-white p-4 sm:p-4 md:p-5 transition-all duration-300 hover:-translate-y-0.5 focus:outline-none h-full flex flex-col",
            "focus-visible-shadow",
            "min-h-[400px]"
          )}
        >
          {onToggleFeatured && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleFeatured}
              className={cn(
                "absolute top-2 left-2 z-10",
                "p-2 rounded-full",
                product.isFeatured
                  ? "bg-yellow-400 text-yellow-900"
                  : "bg-white/80 text-border-base/60",
                "opacity-0 group-hover:opacity-100",
                "transition-opacity duration-200",
                "focus:opacity-100",
                "border",
                product.isFeatured
                  ? "border-yellow-500/60"
                  : "border-border-base/30",
                "focus-ring-white"
              )}
              aria-label={
                product.isFeatured
                  ? "Quitar de destacados"
                  : "Marcar como destacado"
              }
              title={
                product.isFeatured
                  ? "Quitar de destacados"
                  : "Marcar como destacado"
              }
            >
              <Star
                size={20}
                className={product.isFeatured ? "fill-current" : ""}
              />
            </motion.button>
          )}
          <div className="mb-4 shrink-0">
            {product.model3DUrl ? (
              <ProductModelViewer
                src={product.model3DUrl}
                poster={product.image[0] || ""}
                alt={product.alt || product.name}
                autoRotate
                cameraControls={false}
                variant="card"
              />
            ) : (
              <div className="aspect-square overflow-hidden rounded-2xl border border-border-base/30">
                <img
                  src={product.image[0] || ""}
                  alt={product.alt || product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <h3 className="font-semibold text-base sm:text-lg text-border-base line-clamp-2 font-baloo">
              {product.name}
            </h3>
            <div className="flex flex-col gap-1.5">
              {product.originalPrice &&
              product.originalPrice > product.price ? (
                <>
                  <div className="flex items-center gap-2">
                    <p
                      className="text-xl sm:text-2xl font-semibold text-toad-eyes"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      {formatCurrency(product.price)}
                    </p>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                      -
                      {calculateDiscountPercentage(
                        product.originalPrice,
                        product.price
                      )}
                      %
                    </span>
                  </div>
                  <p
                    className="text-sm text-border-base/60 line-through"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    {formatCurrency(product.originalPrice)}
                  </p>
                </>
              ) : (
                <p
                  className="text-xl sm:text-2xl font-semibold text-toad-eyes"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {formatCurrency(product.price)}
                </p>
              )}
              {product.bulkPricingRules &&
                product.bulkPricingRules.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-2 py-1">
                    <span className="text-green-700 font-bold text-xs">🎉</span>
                    <span
                      className="text-xs font-semibold text-green-700"
                      style={{ fontFamily: "var(--font-nunito)" }}
                    >
                      Descuentos por cantidad disponibles
                    </span>
                  </div>
                )}
            </div>

            {product.plasticType && (
              <div className="flex items-center gap-2">
                <span
                  className="text-xs text-border-base/70"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  {product.plasticType}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span
                className="text-xs text-border-base/70"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Stock: {product.stock} unidad{product.stock === 1 ? "" : "es"}
              </span>
            </div>

            {personalizableParts > 0 && (
              <div className="flex items-center gap-2">
                <span
                  className="text-xs text-border-base/70"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  {personalizableParts} parte
                  {personalizableParts === 1 ? "" : "s"} personalizable
                  {personalizableParts === 1 ? "" : "s"} · {totalColors} color
                  {totalColors === 1 ? "" : "es"} disponible
                  {totalColors === 1 ? "" : "s"}
                </span>
              </div>
            )}

            {(product.accessories && product.accessories.length > 0) ||
            product.accessory ? (
              <div className="flex items-center gap-2">
                <span
                  className="text-xs text-border-base/70"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Accesorios opcionales, se venden por separado.
                </span>
              </div>
            ) : null}

            {onEdit ? (
              <motion.button
                type="button"
                onClick={handleEditClick}
                className="inline-flex items-center justify-center rounded-full border border-border-base/30 bg-white px-4 py-1.5 text-sm font-semibold text-border-base transition-colors hover:bg-bouncy-lemon hover:border-bouncy-lemon hover:text-contrast-base focus:outline-none mt-auto"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={motionVariants.spring}
                aria-label={editLabel}
              >
                {editLabel}
              </motion.button>
            ) : (
              <div className="flex flex-col gap-2 mt-auto">
                <Button
                  onClick={handleOpenDetails}
                  variant="secondary"
                  className="px-4 py-2 text-sm sm:px-4 sm:py-2 sm:text-sm"
                >
                  Ver detalles
                </Button>
                {(personalizableParts > 0 || colorMode === "disabled" || hasColorsDefined) && (
                  <Button
                    onClick={handleOpenCustomize}
                    variant="primary"
                    className="px-4 py-2 text-sm sm:px-4 sm:py-2 sm:text-sm"
                  >
                    Agregar al carrito
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductDetailModal
        product={product}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
      <ProductCustomizeModal
        product={product}
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
      />
    </>
  );
};

export default ProductCard;
