import { Link } from "react-router-dom";
import { Product } from "@/types";
import { Badge } from "@/components";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link
      to="/productos"
      aria-label={`Ver ${product.name} en la página de productos`}
      className="group block outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-bouncy-lemon)]/60 focus-visible:ring-offset-2 rounded-3xl"
    >
      <div className="relative rounded-3xl border-4 border-[var(--color-border-blue)] bg-white p-4 sm:p-4 md:p-5 shadow-[0_4px_12px_rgba(39,76,154,0.15),0_8px_24px_rgba(39,76,154,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(39,76,154,0.2),0_12px_32px_rgba(39,76,154,0.15)]">
        {product.badge && <Badge label={product.badge} />}

        <div className="aspect-[4/3] overflow-hidden rounded-2xl mb-4">
          <img
            src={product.image}
            alt={product.alt || product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="space-y-2">
          <h3
            className="font-semibold text-base sm:text-lg text-[var(--color-border-blue)] line-clamp-2 min-h-[3.5rem]"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            {product.name}
          </h3>
          <p
            className="text-lg sm:text-xl font-semibold text-[var(--color-border-blue)]"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            ${product.price.toLocaleString("es-ES")}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
