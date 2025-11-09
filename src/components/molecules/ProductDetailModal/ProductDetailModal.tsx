import { useMemo, useState } from "react";
import { Product } from "@/types";
import { Modal, Button, ColorChip } from "@/components";
import { useCart } from "@/hooks";

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const images = product.images?.length ? product.images : [product.image];
  const { getItemQuantity } = useCart();

  const quantityInCart = getItemQuantity(product.id);
  const remainingStock = useMemo(
    () => Math.max(product.stock - quantityInCart, 0),
    [product.stock, quantityInCart]
  );
  const isOutOfStock = remainingStock === 0;

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
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full border-2 border-[var(--color-border-blue)] text-[var(--color-border-blue)] transition-colors focus:outline-none z-10"
          aria-label="Cerrar modal"
        >
          <span className="text-xl font-bold">×</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-3xl border-4 border-[var(--color-border-blue)]">
              <img
                src={images[selectedImageIndex]}
                alt={product.alt || product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-[var(--color-border-blue)] scale-105"
                        : "border-[var(--color-border-blue)]/30 hover:border-[var(--color-border-blue)]/60"
                    }`}
                    aria-label={`Ver imagen ${index + 1}`}
                  >
                    <img
                      src={img}
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
                className="text-2xl sm:text-3xl font-semibold text-[var(--color-toad-eyes)] mb-4"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                ${product.price.toLocaleString("es-ES")}
              </p>
            </div>

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
