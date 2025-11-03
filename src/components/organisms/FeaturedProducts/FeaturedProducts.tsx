import { Heading, Button, ProductCard } from "@/components";
import type { Product } from "@/types";

interface FeaturedProductsProps {
  id?: string;
  title?: string;
  subtitle?: string;
  products: Product[];
  ctaText?: string;
  onCtaClick?: () => void;
  onProductClick?: (product: Product) => void;
}

const FeaturedProducts = ({
  id,
  title = "Productos Destacados",
  subtitle = "Descubre nuestras mejores impresiones 3D",
  products,
  ctaText = "Ver todos los productos",
  onCtaClick,
  onProductClick,
}: FeaturedProductsProps) => {
  return (
    <section id={id} className="w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-24 bg-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <Heading level={2} className="mb-3 md:mb-4">
            {title}
          </Heading>
          <p className="text-base sm:text-lg text-[var(--color-text)] opacity-70 max-w-2xl mx-auto px-4">
            {subtitle}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => {
                onProductClick?.(product);
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <Button variant="primary" size="md" onClick={onCtaClick} className="md:!px-8 md:!py-4 md:!text-lg">
            {ctaText}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

