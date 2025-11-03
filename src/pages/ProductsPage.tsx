import { useMemo, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  Heading,
  Button,
  ProductCard,
  ProductCardSkeleton,
  HorizontalScroll,
} from "@/components";
import { ALL_PRODUCTS } from "@/constants";
import { modelsService } from "@/services";
import { useNavigateBack } from "@/hooks";
import { modelsToProducts } from "@/utils/modelToProduct";
import type { Product } from "@/types";

const CATEGORIES = ["Pokemon", "Anime", "Videojuegos"] as const;

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = useNavigateBack("/");
  const [isLoading, setIsLoading] = useState(true);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (location.pathname === "/productos") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.pathname]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const models = await modelsService.getPublic();
        const convertedProducts = modelsToProducts(models);
        setDbProducts(convertedProducts);
      } catch (error) {
        console.error("Error al cargar productos de la base de datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadProducts();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

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
