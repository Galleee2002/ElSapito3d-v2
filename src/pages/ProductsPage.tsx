import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  Heading,
  Button,
  ProductCard,
  ProductCardSkeleton,
  HorizontalScroll,
} from "@/components";
import { ALL_PRODUCTS } from "@/constants";
import { useNavigateBack, useDbProducts, useScrollToTop } from "@/hooks";
import { scrollToTop } from "@/utils";

const CATEGORIES = ["Pokemon", "Anime", "Videojuegos"] as const;

const ProductsPage = () => {
  const navigate = useNavigate();
  const handleBack = useNavigateBack("/");
  const { dbProducts, isLoading } = useDbProducts();
  useScrollToTop();

  const allProducts = useMemo(() => {
    return [...ALL_PRODUCTS, ...dbProducts];
  }, [dbProducts]);

  const productsByCategory = useMemo(() => {
    const categories = new Set<string>();
    allProducts.forEach((p) => {
      if (p.category) categories.add(p.category);
    });
    CATEGORIES.forEach((cat) => categories.add(cat));

    return Array.from(categories).map((category) => ({
      category,
      items: allProducts.filter((p) => p.category === category),
    }));
  }, [allProducts]);

  return (
    <section className="w-full min-h-screen bg-(--color-surface) pt-24 sm:pt-28 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8 sm:mb-10 md:mb-12 mt-10!">
          <Button
            variant="accent"
            size="sm"
            onClick={handleBack}
            className="px-3! py-2!"
          >
            <ArrowLeft size={18} />
          </Button>
          <Heading level={2}>Productos</Heading>
        </div>

        {productsByCategory.map(({ category, items }) => (
          <div key={category} className="mb-10 sm:mb-12 md:mb-16">
            <div className="flex items-end justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold">
                {category}
              </h3>
              <span className="text-sm opacity-70">
                {items.length} productos
              </span>
            </div>
            <HorizontalScroll>
              {isLoading
                ? Array.from({ length: items.length || 4 }).map((_, index) => (
                    <div
                      key={`skeleton-${category}-${index}`}
                      className="snap-start shrink-0 w-[72%] sm:w-[48%] md:w-[32%] lg:w-[24%]"
                    >
                      <ProductCardSkeleton size="sm" />
                    </div>
                  ))
                : items.map((product) => (
                    <div
                      key={product.id}
                      className="snap-start shrink-0 w-[72%] sm:w-[48%] md:w-[32%] lg:w-[24%]"
                    >
                      <ProductCard
                        product={product}
                        size="sm"
                        onClick={() => {
                          navigate(`/producto/${product.id}`);
                          scrollToTop();
                        }}
                      />
                    </div>
                  ))}
            </HorizontalScroll>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductsPage;
