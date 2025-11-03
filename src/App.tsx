import { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { MainLayout, Hero, FeaturedProducts, AboutUs } from "@/components";
import { FEATURED_PRODUCTS } from "@/constants";
import { useDbProducts } from "@/hooks";
import { scrollToSection, scrollToTop } from "@/utils";
import heroImage1 from "@/assets/images/img-hero.jpg";
import heroImage2 from "@/assets/images/img-hero-2.jpg";
import heroImage3 from "@/assets/images/img-hero-3.jpg";

const AuthPage = lazy(() => import("@/pages/AuthPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"));
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));

const HERO_IMAGES = [heroImage1, heroImage2, heroImage3];

const App = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { dbProducts } = useDbProducts({ limit: 6 });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Cargando...
        </div>
      }
    >
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
                  scrollToTop();
                }}
              />
              <AboutUs
                id="nosotros"
                onContactClick={() => scrollToSection("contacto")}
              />
            </MainLayout>
          }
        />
        <Route path="/auth" element={<AuthPage />} />
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
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;
