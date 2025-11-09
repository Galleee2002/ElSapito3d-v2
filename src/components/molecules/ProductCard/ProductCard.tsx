import { KeyboardEvent, MouseEvent, useState } from "react";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { ProductDetailModal } from "@/components";
import { motionVariants, FOCUS_VISIBLE_SHADOW } from "@/constants";
import { cn } from "@/utils";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => boolean;
  onEdit?: (product: Product) => void;
  editLabel?: string;
}

const ProductCard = ({
  product,
  onAddToCart,
  onEdit,
  editLabel = "Modificar Producto",
}: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetails = () => {
    setIsModalOpen(true);
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

  return (
    <>
      <div className="w-full">
        <div
          role="button"
          tabIndex={0}
          aria-label={`Ver detalles de ${product.name}`}
          onClick={handleOpenDetails}
          onKeyDown={handleKeyDown}
          className={cn(
            "group relative rounded-3xl border-4 sm:border-[5px] border-[var(--color-border-blue)] bg-white p-4 sm:p-4 md:p-5 transition-all duration-300 hover:-translate-y-0.5 focus:outline-none",
            FOCUS_VISIBLE_SHADOW
          )}
        >
          <div className="aspect-square overflow-hidden rounded-2xl mb-4 border-2 border-[var(--color-border-blue)]">
            <img
              src={product.image}
              alt={product.alt || product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="space-y-2">
            <h3
              className="font-semibold text-base sm:text-lg text-[var(--color-border-blue)] line-clamp-2 min-h-[3.5rem]"
              style={{ fontFamily: "var(--font-baloo)" }}
            >
              {product.name}
            </h3>
            <p
              className="text-xl sm:text-2xl font-semibold text-[var(--color-toad-eyes)]"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              ${product.price.toLocaleString("es-ES")}
            </p>
            <p
              className="text-sm text-[var(--color-border-blue)]/80 line-clamp-3"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              {product.description}
            </p>
            {onEdit ? (
              <motion.button
                type="button"
                onClick={handleEditClick}
                className="inline-flex items-center justify-center rounded-full border-2 border-[var(--color-border-blue)] bg-white px-4 py-1.5 text-sm font-semibold text-[var(--color-border-blue)] transition-colors hover:bg-[var(--color-border-blue)] hover:text-white focus:outline-none"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={motionVariants.spring}
                aria-label={editLabel}
              >
                {editLabel}
              </motion.button>
            ) : (
              <span
                className="inline-block text-sm font-semibold text-[var(--color-border-blue)]/80"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Ver detalles
              </span>
            )}
          </div>
        </div>
      </div>

      <ProductDetailModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={onAddToCart ? () => onAddToCart(product) : undefined}
      />
    </>
  );
};

export default ProductCard;
