import { Product } from "@/types";
import { ProductCard, ButtonLink } from "@/components";

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

const FeaturedProducts = ({
  products,
  title = "Productos Destacados",
  subtitle,
}: FeaturedProductsProps) => {
  return (
    <section className="py-12 sm:py-14 md:py-16 px-4 sm:px-5 md:px-6 bg-[#F5FAFF]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-border-blue)] mb-2"
              style={{ fontFamily: "var(--font-baloo)" }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm sm:text-base md:text-lg text-[var(--color-border-blue)]/80 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <ButtonLink to="/productos" ariaLabel="Ver todos los productos">
              Ver más
            </ButtonLink>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
