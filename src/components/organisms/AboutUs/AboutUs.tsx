import { Heading, Button, Statistics, VideoSection } from "@/components";
import { cn } from "@/utils";
import heroImage1 from "@/assets/images/img-hero.jpg";

interface AboutUsProps {
  id?: string;
  onContactClick?: () => void;
}

const AboutUs = ({ id, onContactClick }: AboutUsProps) => {
  const stats = [
    { value: "5+", label: "Años de experiencia" },
    { value: "500+", label: "Proyectos realizados" },
    { value: "300+", label: "Clientes satisfechos" },
  ];

  const handleContactClick = () => {
    if (onContactClick) {
      onContactClick();
    } else {
      document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id={id} className="w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-24 bg-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mb-12 md:mb-16">
          <div className="w-full order-2 md:order-1">
            <img
              src={heroImage1}
              alt="Quienes somos"
              className="w-full h-auto rounded-[var(--radius-lg)] object-cover aspect-square md:aspect-auto"
            />
          </div>
          <div className="flex flex-col justify-center order-1 md:order-2">
            <Heading level={2} className="mb-4 sm:mb-6">
              Quienes Somos
            </Heading>
            <p className="text-base sm:text-lg text-[var(--color-text)] opacity-80 mb-6 sm:mb-8 leading-relaxed">
              Somos especialistas en impresión 3D profesional con años de experiencia transformando ideas en realidad.
              Nuestro compromiso es ofrecer productos de alta calidad con materiales premium y acabados excepcionales.
              Trabajamos con dedicación para cada proyecto, asegurando precisión y excelencia en cada pieza que creamos.
            </p>
            <Button
              variant="accent"
              size="md"
              onClick={handleContactClick}
              className="self-start"
            >
              Contactanos
            </Button>
          </div>
        </div>

        <div className="mb-12 md:mb-16">
          <Statistics stats={stats} />
        </div>

        <VideoSection videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ" />
      </div>
    </section>
  );
};

export default AboutUs;

