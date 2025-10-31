import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import MainLayout from "./components/templates/MainLayout";
import { Hero, FeaturedProducts, ProductDetailModal } from "./components/organisms";
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
    fullDescription: "Diseñamos y fabricamos figuras personalizadas con tecnología de impresión 3D de alta resolución. Perfecto para regalos, colecciones o decoración. Múltiples materiales disponibles para diferentes necesidades y presupuestos.",
    price: 2500,
    image: heroImage1,
    images: [heroImage1, heroImage2, heroImage3],
    featured: true,
    colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1"],
    purchaseMethods: ["Transferencia bancaria", "Efectivo", "Mercado Pago"],
    shipping: {
      available: true,
      cost: 0,
      estimatedDays: 7
    }
  },
  {
    id: "2",
    name: "Prototipo Industrial",
    description: "Prototipos funcionales para validar tus diseños antes de producción",
    fullDescription: "Prototipos rápidos de alta calidad para validar conceptos antes de producción en masa. Ideal para empresas, diseñadores e inventores. Disponible en múltiples materiales según aplicación.",
    price: 4500,
    image: heroImage2,
    images: [heroImage2, heroImage3, heroImage1],
    featured: true,
    colors: ["#95A5A6", "#34495E", "#2C3E50"],
    purchaseMethods: ["Transferencia bancaria", "Factura A/B/C"],
    shipping: {
      available: true,
      cost: 500,
      estimatedDays: 10
    }
  },
  {
    id: "3",
    name: "Arte Decorativo",
    description: "Piezas decorativas únicas que transforman cualquier espacio",
    fullDescription: "Creaciones artísticas impresas en 3D para decorar tu hogar o espacio de trabajo. Diseños únicos y personalizables. Cada pieza es una obra de arte que combina estética y tecnología.",
    price: 3200,
    image: heroImage3,
    images: [heroImage3, heroImage1, heroImage2],
    featured: true,
    colors: ["#F39C12", "#E74C3C", "#8E44AD", "#16A085"],
    purchaseMethods: ["Transferencia bancaria", "Efectivo"],
    shipping: {
      available: true,
      cost: 300,
      estimatedDays: 5
    }
  },
];

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const App = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
              onProductClick={(product) => setSelectedProduct(product)}
            />
            {selectedProduct && (
              <ProductDetailModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
              />
            )}
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
