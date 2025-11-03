import { useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Heading, Button, ProductCard, HorizontalScroll } from "@/components";
import { ALL_PRODUCTS } from "@/constants";
import { useNavigateBack } from "@/hooks";

const CATEGORIES = ["Pokemon", "Anime", "Videojuegos"] as const;

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = useNavigateBack("/");

  useEffect(() => {
    if (location.pathname === "/productos") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.pathname]);

  const productsByCategory = useMemo(() => {
    return CATEGORIES.map((category) => ({
      category,
      items: ALL_PRODUCTS.filter((p) => p.category === category),
    }));
  }, []);

  return (
    <section className="w-full min-h-screen bg-[var(--color-surface)] pt-24 sm:pt-28 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8 sm:mb-10 md:mb-12 !mt-10">
          <Button
            variant="accent"
            size="sm"
            onClick={handleBack}
            className="!px-3 !py-2"
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
              {items.map((product) => (
                <div
                  key={product.id}
                  className="snap-start shrink-0 w-[72%] sm:w-[48%] md:w-[32%] lg:w-[24%]"
                >
                  <ProductCard
                    product={product}
                    size="sm"
                    onClick={() => {
                      navigate(`/producto/${product.id}`);
                      window.scrollTo({ top: 0, behavior: "instant" });
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
