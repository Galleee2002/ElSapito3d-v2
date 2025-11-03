import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { MainLayout, Hero, FeaturedProducts, AboutUs } from "@/components";
import {
  AuthPage,
  ProductsPage,
  ProductDetailPage,
  AdminDashboardPage,
} from "@/pages";
import { FEATURED_PRODUCTS } from "@/constants";
import { modelsService } from "@/services";
import { modelsToProducts } from "@/utils";
import heroImage1 from "@/assets/images/img-hero.jpg";
import heroImage2 from "@/assets/images/img-hero-2.jpg";
import heroImage3 from "@/assets/images/img-hero-3.jpg";
import type { Product } from "@/types";

const HERO_IMAGES = [heroImage1, heroImage2, heroImage3];

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const App = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const models = await modelsService.getPublic();
        const convertedProducts = modelsToProducts(models);
        setDbProducts(convertedProducts.slice(0, 6));
      } catch (error) {
        console.error("Error al cargar productos destacados:", error);
      }
    };
    loadProducts();
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <Hero
              title="Impresión 3D Profesional"
              description="Transformamos tus ideas en realidad con tecnología de impresión 3D de última generación. Calidad, precisión y creatividad en cada proyecto."
              ctaText="Ver Productos"
              images={HERO_IMAGES}
              onCtaClick={() => scrollToSection("productos")}
            />
            <FeaturedProducts
              id="productos"
              products={[...FEATURED_PRODUCTS, ...dbProducts]}
              isLoading={isLoading}
              onCtaClick={() => navigate("/productos")}
              onProductClick={(product) => {
                navigate(`/producto/${product.id}`);
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
            />
            <AboutUs
              id="nosotros"
              onContactClick={() => scrollToSection("contacto")}
            />
          </MainLayout>
        }
      />
      <Route
        path="/auth"
        element={<AuthPage />}
      />
      <Route
        path="/productos"
        element={
          <MainLayout navbarSolid>
            <ProductsPage />
          </MainLayout>
        }
      />
      <Route
        path="/producto/:productId"
        element={
          <MainLayout navbarSolid>
            <ProductDetailPage />
          </MainLayout>
        }
      />
      <Route
        path="/admin"
        element={<AdminDashboardPage />}
      />
    </Routes>
  );
};

export default App;
