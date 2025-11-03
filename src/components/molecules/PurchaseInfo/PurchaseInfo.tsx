import { Truck, CreditCard, Package } from "lucide-react";
import { cn } from "@/utils";

interface InfoItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface PurchaseInfoProps {
  className?: string;
}

const PurchaseInfo = ({ className }: PurchaseInfoProps) => {
  const infoItems: InfoItem[] = [
    {
      icon: <Truck size={20} className="text-[var(--color-primary)]" />,
      title: "Envíos",
      description: "Realizamos envíos a todo el país. Consulta tiempos y costos al solicitar tu cotización.",
    },
    {
      icon: <CreditCard size={20} className="text-[var(--color-primary)]" />,
      title: "Forma de pago",
      description: "Aceptamos transferencia bancaria y efectivo. También ofrecemos planes de pago.",
    },
    {
      icon: <Package size={20} className="text-[var(--color-primary)]" />,
      title: "Proceso",
      description: "Una vez aprobada la cotización, comenzamos la producción. Te mantenemos informado en cada etapa.",
    },
  ];

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-text)] mb-4 sm:mb-6">
        Información de compra
      </h3>
      <div className="flex flex-col gap-4">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">{item.icon}</div>
            <div className="flex-1">
              <h4 className="text-base sm:text-lg font-semibold text-[var(--color-text)] mb-1">
                {item.title}
              </h4>
              <p className="text-sm sm:text-base text-[var(--color-text)] opacity-70">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchaseInfo;

