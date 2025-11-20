import { CreditCard, Building2 } from "lucide-react";

interface PaymentMethodSelectorProps {
  selectedMethod: "mercado_pago" | "transfer" | null;
  onSelectMethod: (method: "mercado_pago" | "transfer") => void;
}

const PaymentMethodSelector = ({
  selectedMethod,
  onSelectMethod,
}: PaymentMethodSelectorProps) => {
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
                Pago instantáneo con tarjeta o efectivo
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
                Pago por CBU o Alias + comprobante
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;

