import { useCallback, useEffect, useState } from "react";
import {
  Navbar,
  Hero,
  FeaturedProducts,
  ProductionProcessSection,
  ContactFormSection,
  Footer,
  AuthModal,
} from "@/components";
import { productsService } from "@/services";
import { Product } from "@/types";
import { useCart } from "@/hooks";
import { useToast } from "@/hooks/useToast";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const { addItem } = useCart();
  const { showSuccess, showError } = useToast();

  const loadProducts = useCallback(async () => {
    try {
      const featured = await productsService.getFeatured();
      setFeaturedProducts(featured);
    } catch (error) {
      // Error silenciado - el UI maneja el estado vacío
    }
  }, []);

  useEffect(() => {
    void loadProducts();
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
    <div className="min-h-screen bg-bg text-text-main">
      <Navbar />
      <Hero
        showWave={true}
        waveProps={{
          position: "bottom",
          height: 100,
          offsetY: 48,
          colorClass: "text-[#F5FAFF]",
        }}
      />
      <FeaturedProducts
        products={featuredProducts}
        subtitle="Descubre nuestra selección especial de productos únicos"
        onAddToCart={handleAddToCart}
      />
      <ProductionProcessSection />
      <ContactFormSection />
      <Footer />
      <AuthModal />
    </div>
  );
};

export default HomePage;
