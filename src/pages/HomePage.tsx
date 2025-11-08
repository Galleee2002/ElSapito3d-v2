import { useEffect, useState } from "react";
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

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const allProducts = productsService.getAll();
    setFeaturedProducts(allProducts.slice(0, 4));
  }, []);

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
      />
      <AboutUs />
      <Footer />
      <AuthModal />
    </div>
  );
};

export default HomePage;
