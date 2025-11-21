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
                Presencial - Puedes pagar en efectivo
              </p>
            </div>
          </div>
        </button>

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

