import { Routes, Route, useNavigate } from "react-router-dom";
import MainLayout from "./components/templates/MainLayout";
import { Hero, FeaturedProducts } from "./components/organisms";
import ProductsPage from "./pages/ProductsPage";
import type { Product } from "./types";
import heroImage1 from "./assets/images/img-hero.jpg";
import heroImage2 from "./assets/images/img-hero-2.jpg";
import heroImage3 from "./assets/images/img-hero-3.jpg";

const HERO_IMAGES = [heroImage1, heroImage2, heroImage3];

const FEATURED_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Figura Personalizada",
    description: "Crea tu propia figura única con detalles precisos y acabado profesional",
    price: 2500,
    image: heroImage1,
    featured: true,
  },
  {
    id: "2",
    name: "Prototipo Industrial",
    description: "Prototipos funcionales para validar tus diseños antes de producción",
    price: 4500,
    image: heroImage2,
    featured: true,
  },
  {
    id: "3",
    name: "Arte Decorativo",
    description: "Piezas decorativas únicas que transforman cualquier espacio",
    price: 3200,
    image: heroImage3,
    featured: true,
  },
];

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
              onProductClick={(product) => console.log("Producto seleccionado:", product)}
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
    </Routes>
  );
};

export default App;
