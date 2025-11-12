import { useState, FormEvent } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms";
import { mercadoPagoService } from "@/services";
import { useCart } from "@/hooks";
import { useToast } from "@/hooks/useToast";
import { formatCurrency } from "@/utils";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
}

interface FormErrors {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
}

const CheckoutModal = ({ isOpen, onClose }: CheckoutModalProps) => {
  const { items, totalAmount, clearCart } = useCart();
  const { showError, showSuccess } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = "El nombre es requerido";
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = "El email no es válido";
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = "El teléfono es requerido";
    }

    if (!formData.customer_address.trim()) {
      newErrors.customer_address = "La dirección es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const mpItems = items.map((item) => ({
        id: item.product.id,
        title: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
      }));

      const response = await mercadoPagoService.createPaymentPreference({
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        customer_phone: formData.customer_phone.trim(),
        customer_address: formData.customer_address.trim(),
        amount: totalAmount,
        items: mpItems,
      });

      if (response.success && response.preference.init_point) {
        showSuccess("Redirigiendo a Mercado Pago...");
        clearCart();
        mercadoPagoService.redirectToCheckout(response.preference.init_point);
      } else {
        throw new Error("No se pudo crear la preferencia de pago");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al procesar el pago. Intenta nuevamente.";
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl border-2 border-[var(--color-border-blue)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b-2 border-[var(--color-border-blue)] p-6 flex items-center justify-between z-10">
          <h2
            className="text-2xl font-bold text-[var(--color-border-blue)]"
            style={{ fontFamily: "var(--font-baloo)" }}
          >
            Finalizar compra
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label
              htmlFor="customer_name"
              className="block text-sm font-semibold text-[var(--color-border-blue)] mb-2"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Nombre completo *
            </label>
            <input
              id="customer_name"
              type="text"
              value={formData.customer_name}
              onChange={(e) => handleChange("customer_name", e.target.value)}
              className={`w-full px-4 py-2 border-2 rounded-xl ${
                errors.customer_name
                  ? "border-red-500"
                  : "border-[var(--color-border-blue)]"
              } focus:outline-none focus:ring-2 focus:ring-[var(--color-border-blue)]`}
              style={{ fontFamily: "var(--font-nunito)" }}
              disabled={isSubmitting}
            />
            {errors.customer_name && (
              <p className="mt-1 text-sm text-red-500">{errors.customer_name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="customer_email"
              className="block text-sm font-semibold text-[var(--color-border-blue)] mb-2"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Email *
            </label>
            <input
              id="customer_email"
              type="email"
              value={formData.customer_email}
              onChange={(e) => handleChange("customer_email", e.target.value)}
              className={`w-full px-4 py-2 border-2 rounded-xl ${
                errors.customer_email
                  ? "border-red-500"
                  : "border-[var(--color-border-blue)]"
              } focus:outline-none focus:ring-2 focus:ring-[var(--color-border-blue)]`}
              style={{ fontFamily: "var(--font-nunito)" }}
              disabled={isSubmitting}
            />
            {errors.customer_email && (
              <p className="mt-1 text-sm text-red-500">{errors.customer_email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="customer_phone"
              className="block text-sm font-semibold text-[var(--color-border-blue)] mb-2"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Teléfono *
            </label>
            <input
              id="customer_phone"
              type="tel"
              value={formData.customer_phone}
              onChange={(e) => handleChange("customer_phone", e.target.value)}
              className={`w-full px-4 py-2 border-2 rounded-xl ${
                errors.customer_phone
                  ? "border-red-500"
                  : "border-[var(--color-border-blue)]"
              } focus:outline-none focus:ring-2 focus:ring-[var(--color-border-blue)]`}
              style={{ fontFamily: "var(--font-nunito)" }}
              disabled={isSubmitting}
            />
            {errors.customer_phone && (
              <p className="mt-1 text-sm text-red-500">{errors.customer_phone}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="customer_address"
              className="block text-sm font-semibold text-[var(--color-border-blue)] mb-2"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              Dirección de envío *
            </label>
            <textarea
              id="customer_address"
              value={formData.customer_address}
              onChange={(e) => handleChange("customer_address", e.target.value)}
              rows={3}
              className={`w-full px-4 py-2 border-2 rounded-xl resize-none ${
                errors.customer_address
                  ? "border-red-500"
                  : "border-[var(--color-border-blue)]"
              } focus:outline-none focus:ring-2 focus:ring-[var(--color-border-blue)]`}
              style={{ fontFamily: "var(--font-nunito)" }}
              disabled={isSubmitting}
            />
            {errors.customer_address && (
              <p className="mt-1 text-sm text-red-500">{errors.customer_address}</p>
            )}
          </div>

          <div className="pt-4 border-t-2 border-[var(--color-border-blue)]">
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-lg font-semibold text-[var(--color-border-blue)]"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Total a pagar:
              </span>
              <span
                className="text-2xl font-bold text-[var(--color-border-blue)]"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                {formatCurrency(totalAmount)}
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Pagar con Mercado Pago"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;

