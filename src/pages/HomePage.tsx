import { Navbar, Hero, FeaturedProducts } from "@/components";
import { Product } from "@/types";

const featuredProducts: Product[] = [
  {
    id: "1",
    name: "Sapito de Escritorio",
    price: 25.99,
    image:
      "https://images.unsplash.com/photo-1615789591457-74a63395c990?w=400&h=300&fit=crop",
    badge: "Nuevo",
    alt: "Sapito de escritorio en 3D",
  },
  {
    id: "2",
    name: "Marco Decorativo",
    price: 18.5,
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    badge: "Top",
    alt: "Marco decorativo impreso en 3D",
  },
  {
    id: "3",
    name: "Portalápices Creativo",
    price: 15.75,
    image:
      "https://images.unsplash.com/photo-1611522135882-37d84284fdbc?w=400&h=300&fit=crop",
    alt: "Portalápices creativo en 3D",
  },
  {
    id: "4",
    name: "Organizador de Escritorio",
    price: 32.0,
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop",
    badge: "Nuevo",
    alt: "Organizador de escritorio en 3D",
  },
];

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero
        showWave={true}
        waveProps={{
          position: "bottom",
          height: 80,
          colorClass: "text-[#F5FAFF]",
          className: "translate-y-5",
        }}
      />
      <FeaturedProducts
        products={featuredProducts}
        subtitle="Descubre nuestra selección especial de productos únicos"
      />
    </div>
  );
};

export default HomePage;
