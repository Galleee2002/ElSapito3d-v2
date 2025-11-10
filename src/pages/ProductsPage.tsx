import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductGrid, Navbar, AuthModal } from "@/components";
import { Product } from "@/types";
import { productsService } from "@/services";
import { useCart } from "@/hooks";
import { useToast } from "@/hooks/useToast";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();
  const { showSuccess, showError } = useToast();

  const loadProducts = useCallback(() => {
    const allProducts = productsService.getAll();
    setProducts(allProducts);
  }, []);

  useEffect(() => {
    loadProducts();
    const unsubscribe = productsService.onProductsChanged(loadProducts);
    return unsubscribe;
  }, [loadProducts]);

  const handleAddToCart = useCallback(
    (product: Product) => {
      const wasAdded = addItem(product);
      if (wasAdded) {
        showSuccess("Producto añadido al carrito.");
        return true;
      }
      showError(`No queda más stock de ${product.name}.`);
      return false;
    },
    [addItem, showError, showSuccess]
  );

  return (
    <div className="min-h-screen bg-[#F5FAFF]">
      <Navbar />
      <div className="py-12 sm:py-14 md:py-16 px-4 sm:px-5 md:px-6 pt-24 sm:pt-28 md:pt-32">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm sm:text-base text-[var(--color-border-blue)] hover:text-[var(--color-border-blue)]/80 mb-6 transition-colors"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            <span>←</span>
            <span>Volver al inicio</span>
          </Link>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-border-blue)] mb-6 sm:mb-8"
            style={{ fontFamily: "var(--font-baloo)" }}
          >
            Todos los Productos
          </h1>
          <p
            className="text-base sm:text-lg text-[var(--color-border-blue)]/80 mb-8 sm:mb-10"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Explora nuestra colección completa de productos únicos impresos en
            3D
          </p>
          <ProductGrid products={products} onAddToCart={handleAddToCart} />
        </div>
      </div>
      <AuthModal />
    </div>
  );
};

export default ProductsPage;
