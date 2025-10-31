import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Heading, Button } from "@/components/atoms";
import ProductCard from "@/components/molecules/ProductCard";
import { HorizontalScroll } from "@/components/molecules";
import { ProductDetailModal } from "@/components/organisms";
import type { Product } from "@/types";
import heroImage1 from "@/assets/images/img-hero.jpg";
import heroImage2 from "@/assets/images/img-hero-2.jpg";
import heroImage3 from "@/assets/images/img-hero-3.jpg";

const PRODUCTS: Array<Product & { category: string }> = [
  {
    id: "p1",
    name: "Pikachu",
    description: "Figura 3D coleccionable",
    fullDescription: "Figura coleccionable de Pikachu de alta calidad impresa en 3D. Detalles precisos y acabado profesional. Perfecta para fanáticos de Pokémon. Incluye base personalizada.",
    price: 1800,
    image: heroImage1,
    images: [heroImage1, heroImage2],
    category: "Pokemon",
    colors: ["#FFD700", "#FFEA00"],
    purchaseMethods: ["Transferencia bancaria", "Mercado Pago"],
    shipping: {
      available: true,
      cost: 0,
      estimatedDays: 7
    }
  },
  {
    id: "p2",
    name: "Charizard",
    description: "Edición especial detallada",
    fullDescription: "Charizard en pose épica con alas extendidas. Modelado detallado que captura cada escama y expresión. Impreso en material premium resistente. Incluye base con logo de Pokémon.",
    price: 3200,
    image: heroImage2,
    images: [heroImage2, heroImage3],
    category: "Pokemon",
    colors: ["#FF8C00", "#FF4500"],
    purchaseMethods: ["Transferencia bancaria", "Efectivo"],
    shipping: {
      available: true,
      cost: 400,
      estimatedDays: 10
    }
  },
  {
    id: "p3",
    name: "Goku SSJ",
    description: "Alta definición y acabado mate",
    fullDescription: "Figura de Goku en Super Saiyan con efecto de aura. Detalles increíbles del cabello, musculatura y expresión. Acabado mate profesional. Perfecta para coleccionistas de Dragon Ball.",
    price: 2900,
    image: heroImage3,
    images: [heroImage3, heroImage1],
    category: "Anime",
    colors: ["#FFD700", "#FFA500"],
    purchaseMethods: ["Transferencia bancaria", "Mercado Pago"],
    shipping: {
      available: true,
      cost: 0,
      estimatedDays: 7
    }
  },
  {
    id: "p4",
    name: "Luffy",
    description: "Versión Gear 5 minimalista",
    fullDescription: "Luffy en Gear 5 con diseño minimalista y elegante. Captura la esencia del personaje con líneas simples. Ideal para decoración moderna. Material resistente y duradero.",
    price: 2600,
    image: heroImage1,
    images: [heroImage1, heroImage2, heroImage3],
    category: "Anime",
    colors: ["#FF6B6B", "#FF8C42"],
    purchaseMethods: ["Transferencia bancaria", "Efectivo"],
    shipping: {
      available: true,
      cost: 300,
      estimatedDays: 7
    }
  },
  {
    id: "p5",
    name: "Kratos",
    description: "Estilo diorama compacto",
    fullDescription: "Diorama de Kratos con Leviathan Axe. Diseño compacto perfecto para escritorio. Detalles impresionantes que reflejan la grandeza del guerrero espartano. Incluye base temática de God of War.",
    price: 3500,
    image: heroImage2,
    images: [heroImage2, heroImage3],
    category: "Videojuegos",
    colors: ["#8B4513", "#CD853F"],
    purchaseMethods: ["Transferencia bancaria", "Mercado Pago"],
    shipping: {
      available: true,
      cost: 0,
      estimatedDays: 14
    }
  },
  {
    id: "p6",
    name: "Zelda",
    description: "Base temática Hyrule",
    fullDescription: "Figura de Zelda con base inspirada en Hyrule. Detalles de la vestimenta y expresión suaves. Acabado mate con toques brillantes. Ideal para fanáticos de la saga The Legend of Zelda.",
    price: 3100,
    image: heroImage3,
    images: [heroImage3, heroImage1],
    category: "Videojuegos",
    colors: ["#9370DB", "#4B0082"],
    purchaseMethods: ["Transferencia bancaria", "Efectivo"],
    shipping: {
      available: true,
      cost: 350,
      estimatedDays: 8
    }
  },
];

const CATEGORIES = ["Pokemon", "Anime", "Videojuegos"] as const;

const ProductsPage = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const productsByCategory = useMemo(() => {
    return CATEGORIES.map((category) => ({
      category,
      items: PRODUCTS.filter((p) => p.category === category),
    }));
  }, []);

  return (
    <>
      <section className="w-full min-h-screen bg-[var(--color-surface)] py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8 sm:mb-10 md:mb-12">
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              }}
              className="!px-3 !py-2"
            >
              <ArrowLeft size={18} />
            </Button>
            <Heading level={2}>Productos</Heading>
          </div>

          {productsByCategory.map(({ category, items }) => (
            <div key={category} className="mb-10 sm:mb-12 md:mb-16">
              <div className="flex items-end justify-between mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold">
                  {category}
                </h3>
                <span className="text-sm opacity-70">
                  {items.length} productos
                </span>
              </div>
              <HorizontalScroll>
                {items.map((product) => (
                  <div
                    key={product.id}
                    className="snap-start shrink-0 w-[72%] sm:w-[48%] md:w-[32%] lg:w-[24%]"
                  >
                    <ProductCard 
                      product={product} 
                      size="sm"
                      onClick={() => setSelectedProduct(product)}
                    />
                  </div>
                ))}
              </HorizontalScroll>
            </div>
          ))}
        </div>
      </section>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
};

export default ProductsPage;
