import { Package, Store } from "lucide-react";

export type DeliveryMethod = "pickup" | "shipping";

interface DeliveryMethodSelectorProps {
  selectedMethod: DeliveryMethod | null;
  onSelectMethod: (method: DeliveryMethod) => void;
}

const DeliveryMethodSelector = ({
  selectedMethod,
  onSelectMethod,
}: DeliveryMethodSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3
        className="text-lg font-semibold text-[var(--color-border-base)] mb-4"
        style={{ fontFamily: "var(--font-nunito)" }}
      >
        Método de entrega
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => onSelectMethod("pickup")}
            className={`p-6 border-2 rounded-xl transition-all ${
              selectedMethod === "pickup"
                ? "border-[var(--color-border-base)] bg-[var(--color-border-base)]/5"
                : "border-[var(--color-border-base)]/30 hover:border-[var(--color-border-base)]/60"
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className={`p-3 rounded-full ${
                  selectedMethod === "pickup"
                    ? "bg-[var(--color-border-base)] text-white"
                    : "bg-[var(--color-border-base)]/10 text-[var(--color-border-base)]"
                }`}
              >
                <Store className="w-6 h-6" />
              </div>
              <div>
                <p
                  className="font-semibold text-[var(--color-border-base)]"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Retiro en Showroom
                </p>
                <p
                  className="text-sm text-gray-600 mt-1"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Retiro presencial en showroom
                </p>
              </div>
            </div>
          </button>
          {selectedMethod === "pickup" && (
            <div className="mt-4 space-y-3">
              <div className="text-center space-y-2">
                <p
                  className="text-sm font-semibold text-[var(--color-border-base)]"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  @BunnyClubShowroom
                </p>
                <p
                  className="text-sm text-gray-700"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Maipú 484 Galeria Maipú Local 24
                </p>
                <p
                  className="text-sm text-gray-600 mt-2"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Horarios: Martes a Viernes de 14hs a 19hs y Sábados de 12hs a 16hs
                </p>
              </div>
              <a
                href="https://www.google.com/maps/place/Maip%C3%BA+484,+C1007+Cdad.+Aut%C3%B3noma+de+Buenos+Aires"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--color-border-base)] hover:underline text-center block"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Ver en Google Maps
              </a>
              <div className="w-full rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13136.252538537983!2d-58.376842!3d-34.602565!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccacc267f767d%3A0x4f13f152ba765ad!2sMaip%C3%BA%20484%2C%20C1007%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1764179859549!5m2!1ses!2sar"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSelectMethod("shipping")}
          className={`p-6 border-2 rounded-xl transition-all ${
            selectedMethod === "shipping"
              ? "border-[var(--color-border-base)] bg-[var(--color-border-base)]/5"
              : "border-[var(--color-border-base)]/30 hover:border-[var(--color-border-base)]/60"
          }`}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div
              className={`p-3 rounded-full ${
                selectedMethod === "shipping"
                  ? "bg-[var(--color-border-base)] text-white"
                  : "bg-[var(--color-border-base)]/10 text-[var(--color-border-base)]"
              }`}
            >
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p
                className="font-semibold text-[var(--color-border-base)]"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Envío a Domicilio
              </p>
              <p
                className="text-sm text-gray-600 mt-1"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Envío - Solo pago digital
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default DeliveryMethodSelector;

