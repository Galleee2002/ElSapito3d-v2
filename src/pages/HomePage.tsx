import { useCallback, useEffect, useState } from "react";
import {
  Navbar,
  Hero,
  FeaturedProducts,
  AboutUs,
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

<<<<<<< HEAD
  const loadProducts = useCallback(() => {
    const allProducts = productsService.getAll();
    setFeaturedProducts(allProducts.slice(0, 4));
=======
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const featured = await productsService.getFeatured();
        setFeaturedProducts(featured);
      } catch (error) {
        console.error("Error al cargar productos destacados:", error);
      }
    };
    void loadFeatured();
>>>>>>> 8780d419d4e364165378edc256fa20ba04963b2e
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
    <div className="min-h-screen">
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
      <AboutUs />
      <Footer />
      <AuthModal />
    </div>
  );
};

export default HomePage;
