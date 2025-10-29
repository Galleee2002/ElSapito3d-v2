import MainLayout from "./components/templates/MainLayout";
import { Hero } from "./components/organisms";
import heroImage1 from "./assets/images/img-hero.jpg";
import heroImage2 from "./assets/images/img-hero-2.jpg";
import heroImage3 from "./assets/images/img-hero-3.jpg";

const App = () => {
  const handleCtaClick = () => {
    const productosSection = document.getElementById("productos");
    productosSection?.scrollIntoView({ behavior: "smooth" });
  };

  const heroImages = [heroImage1, heroImage2, heroImage3];

  return (
    <MainLayout>
      <Hero
        title="Impresión 3D Profesional"
        description="Transformamos tus ideas en realidad con tecnología de impresión 3D de última generación. Calidad, precisión y creatividad en cada proyecto."
        ctaText="Ver Productos"
        images={heroImages}
        onCtaClick={handleCtaClick}
      />
      <section id="productos" className="min-h-screen">
        {/* Contenido de productos */}
      </section>
      <section id="contacto" className="min-h-screen">
        {/* Contenido de contacto */}
      </section>
      <section id="nosotros" className="min-h-screen">
        {/* Contenido de nosotros */}
      </section>
    </MainLayout>
  );
};

export default App;
