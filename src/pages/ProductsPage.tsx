import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Heading, Button } from "@/components/atoms";
import ProductCard from "@/components/molecules/ProductCard";
import { HorizontalScroll } from "@/components/molecules";
import type { Product } from "@/types";
import heroImage1 from "@/assets/images/img-hero.jpg";
import heroImage2 from "@/assets/images/img-hero-2.jpg";
import heroImage3 from "@/assets/images/img-hero-3.jpg";

const PRODUCTS: Array<Product & { category: string }> = [
  {
    id: "p1",
    name: "Pikachu",
    description: "Figura 3D coleccionable",
    price: 1800,
    image: heroImage1,
    category: "Pokemon",
  },
  {
    id: "p2",
    name: "Charizard",
    description: "Edición especial detallada",
    price: 3200,
    image: heroImage2,
    category: "Pokemon",
  },
  {
    id: "p3",
    name: "Goku SSJ",
    description: "Alta definición y acabado mate",
    price: 2900,
    image: heroImage3,
    category: "Anime",
  },
  {
    id: "p4",
    name: "Luffy",
    description: "Versión Gear 5 minimalista",
    price: 2600,
    image: heroImage1,
    category: "Anime",
  },
  {
    id: "p5",
    name: "Kratos",
    description: "Estilo diorama compacto",
    price: 3500,
    image: heroImage2,
    category: "Videojuegos",
  },
  {
    id: "p6",
    name: "Zelda",
    description: "Base temática Hyrule",
    price: 3100,
    image: heroImage3,
    category: "Videojuegos",
  },
];

const CATEGORIES = ["Pokemon", "Anime", "Videojuegos"] as const;

const ProductsPage = () => {
  const navigate = useNavigate();

  const productsByCategory = useMemo(() => {
    return CATEGORIES.map((category) => ({
      category,
      items: PRODUCTS.filter((p) => p.category === category),
    }));
  }, []);

  return (
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
                  <ProductCard product={product} size="sm" />
                </div>
              ))}
            </HorizontalScroll>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductsPage;
