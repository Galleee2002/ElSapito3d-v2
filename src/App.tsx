import { Routes, Route, useNavigate } from "react-router-dom";
import { MainLayout, Hero, FeaturedProducts } from "@/components";
import { ProductsPage, ProductDetailPage } from "@/pages";
import { FEATURED_PRODUCTS } from "@/constants";
import heroImage1 from "@/assets/images/img-hero.jpg";
import heroImage2 from "@/assets/images/img-hero-2.jpg";
import heroImage3 from "@/assets/images/img-hero-3.jpg";

const HERO_IMAGES = [heroImage1, heroImage2, heroImage3];

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const App = () => {
  const navigate = useNavigate();

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
              products={FEATURED_PRODUCTS}
              onCtaClick={() => navigate("/productos")}
              onProductClick={(product) => navigate(`/producto/${product.id}`)}
            />
          </MainLayout>
        }
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
    </Routes>
  );
};

export default App;
