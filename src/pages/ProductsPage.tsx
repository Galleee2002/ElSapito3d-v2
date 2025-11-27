import { useCallback, useEffect, useState, useMemo } from "react";
import { ProductGrid, AuthModal, BackLink } from "@/components";
import { Product, Category } from "@/types";
import { productsService, categoriesService } from "@/services";
import { useToast } from "@/hooks/useToast";
import { MainLayout } from "@/layouts";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      setProductsError(null);
      const allProducts = await productsService.getAll();
      setProducts(allProducts);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No pudimos cargar los productos. Intenta nuevamente.";
      setProductsError(message);
      toast.error(message);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [toast]);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      const allCategories = await categoriesService.getAll();
      setCategories(allCategories);
    } catch {
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
    void loadCategories();
  }, [loadProducts, loadCategories]);

  useEffect(() => {
    const unsubscribeProducts = productsService.onProductsChanged(loadProducts);
    const unsubscribeCategories = categoriesService.onCategoriesChanged(loadCategories);
    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, [loadProducts, loadCategories]);

  const productsByCategory = useMemo(() => {
    const grouped: Record<string, { category: Category | null; products: Product[] }> = {
      uncategorized: { category: null, products: [] },
    };

    categories.forEach((category) => {
      grouped[category.id] = { category, products: [] };
    });

    products.forEach((product) => {
      if (product.categoryId && grouped[product.categoryId]) {
        grouped[product.categoryId].products.push(product);
      } else {
        grouped.uncategorized.products.push(product);
      }
    });

    return Object.values(grouped).filter((group) => group.products.length > 0);
  }, [products, categories]);

  return (
    <MainLayout>
      <div className="py-12 sm:py-14 md:py-16 px-4 sm:px-5 md:px-6 pt-24 sm:pt-28 md:pt-32">
        <div className="max-w-7xl mx-auto">
          <BackLink to="/">Volver al inicio</BackLink>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-main mb-6 sm:mb-8 font-baloo">
            Todos los Productos
          </h1>
          <p
            className="text-base sm:text-lg text-text-muted mb-8 sm:mb-10"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Explora nuestra colección completa de productos únicos impresos en
            3D
          </p>
          {isLoadingProducts || isLoadingCategories ? (
            <div className="text-center py-12">
              <p className="text-base sm:text-lg text-text-muted">
                Cargando productos...
              </p>
            </div>
          ) : productsError ? (
            <div className="text-center py-12">
              <p className="text-base sm:text-lg text-accent mb-4">
                {productsError}
              </p>
              <button
                onClick={() => void loadProducts()}
                className="px-6 py-2 bg-primary text-slate-900 rounded-lg hover:bg-secondary transition-colors"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Reintentar
              </button>
            </div>
          ) : productsByCategory.length > 0 ? (
            <div className="space-y-12 sm:space-y-16">
              {productsByCategory.map((group) => (
                <section key={group.category?.id || "uncategorized"}>
                  {group.category && (
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-main mb-6 sm:mb-8 font-baloo">
                      {group.category.name}
                    </h2>
                  )}
                  <ProductGrid products={group.products} />
                </section>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-base sm:text-lg text-text-muted">
                No hay productos disponibles en este momento.
              </p>
            </div>
          )}
        </div>
      </div>
      <AuthModal />
    </MainLayout>
  );
};

export default ProductsPage;
