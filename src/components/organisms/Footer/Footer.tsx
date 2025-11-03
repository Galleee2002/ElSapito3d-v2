import { MapPin } from "lucide-react";
import { Heading, MapSection, OrderSteps, PurchaseInfo } from "@/components";
import { cn } from "@/utils";

interface FooterProps {
  onRequestQuote?: () => void;
  className?: string;
}

const Footer = ({ onRequestQuote, className }: FooterProps) => {
  const orderSteps = [
    {
      number: 1,
      title: "Consulta",
      description: "Contactanos con tu idea o diseño. Estamos aquí para ayudarte.",
    },
    {
      number: 2,
      title: "Cotización",
      description: "Te enviamos una cotización detallada con tiempos y costos.",
    },
    {
      number: 3,
      title: "Aprobación",
      description: "Revisas y apruebas la cotización. Coordinamos detalles finales.",
    },
    {
      number: 4,
      title: "Producción",
      description: "Comenzamos a trabajar en tu proyecto con materiales de calidad.",
    },
    {
      number: 5,
      title: "Entrega",
      description: "Tu producto está listo. Coordinamos la entrega o envío.",
    },
  ];

  const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0!2d-58.4!3d-34.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM2JzAwLjAiUyA1OMKwMjQnMDAuMCJX!5e0!3m2!1ses!2sar!4v1234567890";
  const locationDescription = "Encuentranos en nuestro taller. Estamos disponibles para atenderte de lunes a viernes.";

  return (
    <footer
      id="contacto"
      className={cn(
        "w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-24",
        "bg-[var(--color-surface)]",
        className
      )}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 md:mb-16 items-stretch">
          <div className="lg:col-span-1 flex flex-col p-6 rounded-[var(--radius-lg)] border border-black/10 bg-white/50">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={18} className="text-[var(--color-primary)] shrink-0" />
              <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-text)]">
                Nuestra ubicación
              </h3>
            </div>
            <div className="flex-1 flex flex-col">
              <MapSection mapUrl={mapUrl} description={locationDescription} />
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col p-6 rounded-[var(--radius-lg)] border border-black/10 bg-white/50">
            <OrderSteps steps={orderSteps} onRequestQuote={onRequestQuote} />
          </div>

          <div className="lg:col-span-1 flex flex-col p-6 rounded-[var(--radius-lg)] border border-black/10 bg-white/50">
            <PurchaseInfo />
          </div>
        </div>

        <div className="pt-8 border-t border-black/10 text-center">
          <p className="text-sm text-[var(--color-text)] opacity-60">
            © {new Date().getFullYear()} ElSapito3D. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

