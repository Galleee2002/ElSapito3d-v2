import { useMemo, useState, useEffect } from "react";
import { Modal, Button, ColorChip } from "@/components";
import { useCart } from "@/hooks";
import { Product } from "@/types";
import { FOCUS_RING_WHITE } from "@/constants";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: () => boolean;
}

const ProductDetailModal = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) => {
  const { getItemQuantity } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const quantityInCart = getItemQuantity(product.id);
  const remainingStock = useMemo(
    () => Math.max(product.stock - quantityInCart, 0),
    [product.stock, quantityInCart]
  );
  const isOutOfStock = remainingStock === 0;

  const images = product.image.length > 0 ? product.image : [""];
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product.id, isOpen]);

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleImageSelect = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleAddToCart = () => {
    const wasAdded = onAddToCart?.() ?? false;
    if (wasAdded) {
      onClose();
    }
  };

  const renderField = (label: string, value: string | undefined) => {
    if (!value) return null;
    return (
      <div>
        <h4
          className="text-lg font-semibold text-[var(--color-border-blue)] mb-2"
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          {label}
        </h4>
        <p
          className="text-base text-[var(--color-border-blue)]/80"
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
      <div className="relative p-4 sm:p-6 md:p-8">
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full border-2 border-[var(--color-border-blue)] bg-white text-[var(--color-border-blue)] transition-colors z-10 ${FOCUS_RING_WHITE}`}
          aria-label="Cerrar modal"
        >
          <span className="text-xl font-bold">×</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-3xl border-4 border-[var(--color-border-blue)] group">
              <img
                src={images[currentImageIndex] || ""}
                alt={product.alt || product.name}
                className="w-full h-full object-cover"
              />
              {hasMultipleImages && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-full border-2 border-[var(--color-border-blue)] text-[var(--color-border-blue)] transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-full border-2 border-[var(--color-border-blue)] text-[var(--color-border-blue)] transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
            {hasMultipleImages && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageSelect(index)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-[var(--color-border-blue)] ring-2 ring-[var(--color-border-blue)]"
                        : "border-gray-300 hover:border-[var(--color-border-blue)]/50"
                    }`}
                    aria-label={`Ver imagen ${index + 1}`}
                  >
                    <img
                      src={image || ""}
                      alt={`${product.name} - Vista ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3
                id="product-title"
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-border-blue)] mb-3"
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
              className="text-base text-[var(--color-border-blue)]/85"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              {product.description}
            </p>

            {renderField("Tipo de Plástico", product.plasticType)}
            {renderField("Tiempo de Impresión", product.printTime)}

            {product.availableColors && product.availableColors.length > 0 && (
              <div>
                <h4
                  className="text-lg font-semibold text-[var(--color-border-blue)] mb-3"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  Colores Disponibles
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.availableColors.map((color, index) => (
                    <ColorChip key={index} color={color} />
                  ))}
                </div>
              </div>
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
                className="basis-full text-sm text-[var(--color-border-blue)]/70 text-center sm:text-left sm:mt-2"
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
