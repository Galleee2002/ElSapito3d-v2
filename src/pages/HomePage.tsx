import { useCallback, useEffect, useState } from "react";
import {
  Hero,
  FeaturedProducts,
  ProductionProcessSection,
  ContactFormSection,
  Footer,
  AuthModal,
} from "@/components";
import { productsService } from "@/services";
import { Product } from "@/types";
import { MainLayout } from "@/layouts";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

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

  return (
    <MainLayout>
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
      />
      <ProductionProcessSection />
      <ContactFormSection />
      <Footer />
      <AuthModal />
    </MainLayout>
  );
};

export default HomePage;
