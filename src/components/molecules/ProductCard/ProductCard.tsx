import { useState } from "react";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { Badge, ProductDetailModal } from "@/components";
import {
  hoverVariants,
  motionVariants,
  FOCUS_VISIBLE_SHADOW,
} from "@/constants";
import { cn } from "@/utils";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => boolean;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        aria-label={`Ver detalles de ${product.name}`}
        className={cn(
          "group w-full text-left outline-none rounded-3xl",
          FOCUS_VISIBLE_SHADOW
        )}
      >
        <div className="relative rounded-3xl border-4 sm:border-[5px] border-[var(--color-border-blue)] bg-white p-4 sm:p-4 md:p-5 transition-all duration-300 hover:-translate-y-0.5">
          {product.badge && <Badge label={product.badge} />}

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
            <motion.span
              className="relative inline-block text-sm text-[var(--color-border-blue)]/80 mt-2 group/link cursor-pointer"
              style={{ fontFamily: "var(--font-nunito)" }}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              initial="initial"
              variants={{
                initial: { scale: 1, y: 0 },
                hover: hoverVariants.scaleLarge,
              }}
              transition={motionVariants.spring}
            >
              Ver detalles
              <motion.span
                className="absolute bottom-0 left-0 h-[2px] bg-[var(--color-bouncy-lemon)] origin-left pointer-events-none"
                style={{ width: "100%" }}
                variants={{
                  initial: { scaleX: 0 },
                  hover: { scaleX: 1 },
                }}
                transition={{
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                }}
              />
            </motion.span>
          </div>
        </div>
      </button>

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
