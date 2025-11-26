import { CreditCard, Building2, Banknote } from "lucide-react";

export type PaymentMethodType = "mercado_pago" | "transfer" | "efectivo";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType | null;
  onSelectMethod: (method: PaymentMethodType) => void;
  deliveryMethod: "pickup" | "shipping" | null;
}

const PaymentMethodSelector = ({
  selectedMethod,
  onSelectMethod,
  deliveryMethod,
}: PaymentMethodSelectorProps) => {
  const isShipping = deliveryMethod === "shipping";
  const isPickup = deliveryMethod === "pickup";

  return (
    <div className="space-y-4">
      <h3
        className="text-lg font-semibold text-[var(--color-border-base)] mb-4"
        style={{ fontFamily: "var(--font-nunito)" }}
      >
        Selecciona tu método de pago
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onSelectMethod("mercado_pago")}
          className={`p-6 border-2 rounded-xl transition-all ${
            selectedMethod === "mercado_pago"
              ? "border-[var(--color-border-base)] bg-[var(--color-border-base)]/5"
              : "border-[var(--color-border-base)]/30 hover:border-[var(--color-border-base)]/60"
          }`}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div
              className={`p-3 rounded-full ${
                selectedMethod === "mercado_pago"
                  ? "bg-[var(--color-border-base)] text-white"
                  : "bg-[var(--color-border-base)]/10 text-[var(--color-border-base)]"
              }`}
            >
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p
                className="font-semibold text-[var(--color-border-base)]"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Mercado Pago
              </p>
              <p
                className="text-sm text-gray-600 mt-1"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Pago instantáneo con tarjeta (+10% de recargo)
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectMethod("transfer")}
          className={`p-6 border-2 rounded-xl transition-all ${
            selectedMethod === "transfer"
              ? "border-[var(--color-border-base)] bg-[var(--color-border-base)]/5"
              : "border-[var(--color-border-base)]/30 hover:border-[var(--color-border-base)]/60"
          }`}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div
              className={`p-3 rounded-full ${
                selectedMethod === "transfer"
                  ? "bg-[var(--color-border-base)] text-white"
                  : "bg-[var(--color-border-base)]/10 text-[var(--color-border-base)]"
              }`}
            >
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p
                className="font-semibold text-[var(--color-border-base)]"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Transferencia Bancaria
              </p>
              <p
                className="text-sm text-gray-600 mt-1"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Pago por CBU o Alias + comprobante (-5% de descuento)
              </p>
            </div>
          </div>
        </button>

        {isPickup && (
          <button
            type="button"
            onClick={() => onSelectMethod("efectivo")}
            className={`p-6 border-2 rounded-xl transition-all ${
              selectedMethod === "efectivo"
                ? "border-[var(--color-border-base)] bg-[var(--color-border-base)]/5"
                : "border-[var(--color-border-base)]/30 hover:border-[var(--color-border-base)]/60"
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className={`p-3 rounded-full ${
                  selectedMethod === "efectivo"
                    ? "bg-[var(--color-border-base)] text-white"
                    : "bg-[var(--color-border-base)]/10 text-[var(--color-border-base)]"
                }`}
              >
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <p
                  className="font-semibold text-[var(--color-border-base)]"
                style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Efectivo
                </p>
                <p
                  className="text-sm text-gray-600 mt-1"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                Solo retiro presencial (-5% de descuento)
                </p>
              </div>
            </div>
          </button>
        )}
      </div>

      {isShipping && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p
            className="text-sm text-yellow-800"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            ⚠️ Para envíos solo se acepta pago digital (Mercado Pago o Transferencia)
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;

