import { useState, FormEvent, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms";
import {
  PaymentMethodSelector,
  BankTransferForm,
  DeliveryMethodSelector,
  DeliveryAddressForm,
} from "@/components/molecules";
import type { PaymentMethodType } from "@/components/molecules/PaymentMethodSelector/PaymentMethodSelector";
import type { DeliveryMethod } from "@/components/molecules/DeliveryMethodSelector/DeliveryMethodSelector";
import {
  mercadoPagoService,
  paymentsService,
  storageService,
} from "@/services";
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
  street: string;
  city: string;
  postalCode: string;
  province: string;
}

interface FormErrors {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  deliveryMethod?: string;
  paymentMethod?: string;
}

const CheckoutModal = ({ isOpen, onClose }: CheckoutModalProps) => {
  const { items, totalAmount, clearCart } = useCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<"delivery" | "form" | "payment">("delivery");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
    street: "",
    city: "",
    postalCode: "",
    province: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep("delivery");
      setDeliveryMethod(null);
      setSelectedPaymentMethod(null);
      setProofFile(null);
      setFormData({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        customer_address: "",
        street: "",
        city: "",
        postalCode: "",
        province: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (deliveryMethod === "shipping" && selectedPaymentMethod === "efectivo") {
      setSelectedPaymentMethod(null);
      toast.error("El pago en efectivo solo está disponible para retiro presencial");
    }
  }, [deliveryMethod, selectedPaymentMethod, toast]);

  if (!isOpen) return null;

  const validateDeliveryStep = (): boolean => {
    const newErrors: FormErrors = {};

    if (!deliveryMethod) {
      newErrors.deliveryMethod = "Debes seleccionar un método de entrega";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

    if (deliveryMethod === "shipping") {
      if (!formData.street.trim()) {
        newErrors.street = "La calle es requerida";
      }
      if (!formData.city.trim()) {
        newErrors.city = "La ciudad es requerida";
      }
      if (!formData.postalCode.trim()) {
        newErrors.postalCode = "El código postal es requerido";
      }
      if (!formData.province.trim()) {
        newErrors.province = "La provincia es requerida";
      }
    } else {
      if (!formData.customer_address.trim()) {
        newErrors.customer_address = "La dirección es requerida";
      }
    }

    const productsWithoutColors = items.filter(
      (item) => !item.selectedColors || item.selectedColors.length === 0
    );

    if (productsWithoutColors.length > 0) {
      const productNames = productsWithoutColors
        .map((item) => item.product.name)
        .join(", ");
      toast.error(
        `Los siguientes productos requieren al menos un color seleccionado: ${productNames}. Por favor, elimina estos productos del carrito o selecciona sus colores.`
      );
      setErrors(newErrors);
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePaymentStep = (): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedPaymentMethod) {
      newErrors.paymentMethod = "Debes seleccionar un método de pago";
    }

    if (deliveryMethod === "shipping" && selectedPaymentMethod === "efectivo") {
      newErrors.paymentMethod = "El pago en efectivo no está disponible para envíos";
    }

    if (deliveryMethod === "pickup" && selectedPaymentMethod === "efectivo") {
      // Efectivo solo disponible para pickup, esto está bien
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToDelivery = (e: FormEvent) => {
    e.preventDefault();

    if (!validateDeliveryStep()) {
      return;
    }

    setCurrentStep("form");
  };

  const handleContinueToPayment = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setCurrentStep("payment");
  };

  const handleBackToDelivery = () => {
    setCurrentStep("delivery");
  };

  const handleBackToForm = () => {
    setCurrentStep("form");
    setSelectedPaymentMethod(null);
    setProofFile(null);
  };

  const handleSubmitMercadoPago = async () => {
    setIsSubmitting(true);

    const mpItems = items.map((item) => ({
      id: item.product.id,
      title: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      selectedColors: (item.selectedColors || []).map((color) => ({
        name: color.name,
        code: color.code,
      })),
    }));

    const address = deliveryMethod === "shipping"
      ? `${formData.street.trim()}, ${formData.city.trim()}, ${formData.postalCode.trim()}, ${formData.province.trim()}`
      : formData.customer_address.trim();

    const paymentPromise = mercadoPagoService.createPaymentPreference({
      customer_name: formData.customer_name.trim(),
      customer_email: formData.customer_email.trim(),
      customer_phone: formData.customer_phone.trim(),
      customer_address: address,
      amount: totalAmount,
      items: mpItems,
      delivery_method: deliveryMethod || undefined,
    });

    toast.promise(paymentPromise, {
      loading: "Procesando pago...",
      success: (response) => {
        if (response.success && response.preference.init_point) {
          clearCart();
          mercadoPagoService.redirectToCheckout(response.preference.init_point);
          return "Redirigiendo a Mercado Pago...";
        }
        return "No se pudo crear la preferencia de pago";
      },
      error: (error) =>
        error instanceof Error
          ? error.message
          : "Error al procesar el pago. Intenta nuevamente.",
    });

    try {
      await paymentPromise;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitTransfer = async () => {
    if (!proofFile) {
      toast.error("Debes subir un comprobante de transferencia");
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadResult = await storageService.uploadPaymentProof(
        proofFile,
        `temp-${Date.now()}`
      );

      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }

      const mpItems = items.map((item) => ({
        id: item.product.id,
        title: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        selectedColors: (item.selectedColors || []).map((color) => ({
          name: color.name,
          code: color.code,
        })),
      }));

      const address = deliveryMethod === "shipping"
        ? `${formData.street.trim()}, ${formData.city.trim()}, ${formData.postalCode.trim()}, ${formData.province.trim()}`
        : formData.customer_address.trim();

      await paymentsService.create({
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        customer_phone: formData.customer_phone.trim(),
        customer_address: address,
        amount: totalAmount,
        payment_method: "transferencia",
        payment_status: "pendiente",
        transfer_proof_url: uploadResult.url,
        notes: `Pago por transferencia - ${deliveryMethod === "pickup" ? "Retiro en showroom" : "Envío a domicilio"} - Pendiente de verificación`,
        metadata: {
          items: mpItems,
          currency: "ARS",
          delivery_method: deliveryMethod,
        },
      });

      clearCart();
      toast.success(
        "Tu pedido ha sido registrado. Te contactaremos una vez verifiquemos el pago."
      );
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al procesar el pago. Intenta nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEfectivo = async () => {
    setIsSubmitting(true);

    try {
      const mpItems = items.map((item) => ({
        id: item.product.id,
        title: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        selectedColors: (item.selectedColors || []).map((color) => ({
          name: color.name,
          code: color.code,
        })),
      }));

      await paymentsService.create({
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        customer_phone: formData.customer_phone.trim(),
        customer_address: formData.customer_address.trim(),
        amount: totalAmount,
        payment_method: "efectivo",
        payment_status: "pendiente",
        notes: "Pago en efectivo - Retiro presencial en showroom - Pendiente de confirmación",
        metadata: {
          items: mpItems,
          currency: "ARS",
          delivery_method: "pickup",
        },
      });

      clearCart();
      toast.success(
        "Tu pedido ha sido registrado. Te contactaremos para coordinar el retiro y pago en efectivo."
      );
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al procesar el pago. Intenta nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validatePaymentStep()) {
      if (errors.paymentMethod) {
        toast.error(errors.paymentMethod);
      }
      return;
    }

    if (selectedPaymentMethod === "mercado_pago") {
      await handleSubmitMercadoPago();
    } else if (selectedPaymentMethod === "transfer") {
      await handleSubmitTransfer();
    } else if (selectedPaymentMethod === "efectivo") {
      await handleSubmitEfectivo();
    } else {
      toast.error("Debes seleccionar un método de pago");
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getStepTitle = () => {
    if (currentStep === "delivery") return "Método de entrega";
    if (currentStep === "form") return "Datos del cliente";
    return "Método de pago";
  };

  const getStepNumber = () => {
    if (currentStep === "delivery") return "Paso 1 de 3";
    if (currentStep === "form") return "Paso 2 de 3";
    return "Paso 3 de 3";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl border border-[var(--color-border-base)]/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[var(--color-border-base)]/30 p-6 flex items-center justify-between z-10">
          <div>
            <h2
              className="text-2xl font-bold text-[var(--color-border-base)]"
              style={{ fontFamily: "var(--font-baloo)" }}
            >
              {getStepTitle()}
            </h2>
            <p
              className="text-sm text-gray-600 mt-1"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              {getStepNumber()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={
            currentStep === "delivery"
              ? handleContinueToDelivery
              : currentStep === "form"
              ? handleContinueToPayment
              : handleSubmit
          }
          className="p-6 space-y-6"
        >
          {currentStep === "delivery" && (
            <>
              <DeliveryMethodSelector
                selectedMethod={deliveryMethod}
                onSelectMethod={setDeliveryMethod}
              />
              {errors.deliveryMethod && (
                <p className="text-sm text-red-500">{errors.deliveryMethod}</p>
              )}
            </>
          )}

          {currentStep === "form" && (
            <>
              <div>
                <label
                  htmlFor="customer_name"
                  className="block text-sm font-semibold text-[var(--color-border-base)] mb-2"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Nombre completo *
                </label>
                <input
                  id="customer_name"
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) =>
                    handleChange("customer_name", e.target.value)
                  }
                  className={`w-full px-4 py-2 border rounded-xl ${
                    errors.customer_name
                      ? "border-red-500/60"
                      : "border-[var(--color-border-base)]/30"
                  } focus:outline-none focus:ring-1 focus:ring-[var(--color-border-base)]/50 focus:border-[var(--color-border-base)]/60`}
                  style={{ fontFamily: "var(--font-nunito)" }}
                  disabled={isSubmitting}
                />
                {errors.customer_name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.customer_name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="customer_email"
                  className="block text-sm font-semibold text-[var(--color-border-base)] mb-2"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Email *
                </label>
                <input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) =>
                    handleChange("customer_email", e.target.value)
                  }
                  className={`w-full px-4 py-2 border rounded-xl ${
                    errors.customer_email
                      ? "border-red-500/60"
                      : "border-[var(--color-border-base)]/30"
                  } focus:outline-none focus:ring-1 focus:ring-[var(--color-border-base)]/50 focus:border-[var(--color-border-base)]/60`}
                  style={{ fontFamily: "var(--font-nunito)" }}
                  disabled={isSubmitting}
                />
                {errors.customer_email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.customer_email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="customer_phone"
                  className="block text-sm font-semibold text-[var(--color-border-base)] mb-2"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Teléfono *
                </label>
                <input
                  id="customer_phone"
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) =>
                    handleChange("customer_phone", e.target.value)
                  }
                  className={`w-full px-4 py-2 border rounded-xl ${
                    errors.customer_phone
                      ? "border-red-500/60"
                      : "border-[var(--color-border-base)]/30"
                  } focus:outline-none focus:ring-1 focus:ring-[var(--color-border-base)]/50 focus:border-[var(--color-border-base)]/60`}
                  style={{ fontFamily: "var(--font-nunito)" }}
                  disabled={isSubmitting}
                />
                {errors.customer_phone && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.customer_phone}
                  </p>
                )}
              </div>

              {deliveryMethod === "shipping" ? (
                <DeliveryAddressForm
                  street={formData.street}
                  city={formData.city}
                  postalCode={formData.postalCode}
                  province={formData.province}
                  onStreetChange={(value) => handleChange("street", value)}
                  onCityChange={(value) => handleChange("city", value)}
                  onPostalCodeChange={(value) =>
                    handleChange("postalCode", value)
                  }
                  onProvinceChange={(value) => handleChange("province", value)}
                  errors={{
                    street: errors.street,
                    city: errors.city,
                    postalCode: errors.postalCode,
                    province: errors.province,
                  }}
                  disabled={isSubmitting}
                />
              ) : (
                <div>
                  <label
                    htmlFor="customer_address"
                    className="block text-sm font-semibold text-[var(--color-border-base)] mb-2"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    Dirección para contacto *
                  </label>
                  <textarea
                    id="customer_address"
                    value={formData.customer_address}
                    onChange={(e) =>
                      handleChange("customer_address", e.target.value)
                    }
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-xl resize-none ${
                      errors.customer_address
                        ? "border-red-500/60"
                        : "border-[var(--color-border-base)]/30"
                    } focus:outline-none focus:ring-1 focus:ring-[var(--color-border-base)]/50 focus:border-[var(--color-border-base)]/60`}
                    style={{ fontFamily: "var(--font-nunito)" }}
                    disabled={isSubmitting}
                    placeholder="Dirección de referencia (opcional para retiro)"
                  />
                  {errors.customer_address && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.customer_address}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {currentStep === "payment" && (
            <>
              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onSelectMethod={setSelectedPaymentMethod}
                deliveryMethod={deliveryMethod}
              />
              {errors.paymentMethod && (
                <p className="text-sm text-red-500">{errors.paymentMethod}</p>
              )}

              {selectedPaymentMethod === "transfer" && (
                <BankTransferForm
                  onFileSelect={setProofFile}
                  selectedFile={proofFile}
                  isSubmitting={isSubmitting}
                />
              )}

              {selectedPaymentMethod === "mercado_pago" && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p
                    className="text-sm text-blue-800"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    Serás redirigido a Mercado Pago para completar tu pago de
                    forma segura.
                  </p>
                </div>
              )}

              {selectedPaymentMethod === "efectivo" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p
                    className="text-sm text-green-800"
                    style={{ fontFamily: "var(--font-nunito)" }}
                  >
                    ✓ Pagarás en efectivo al retirar tu pedido en el showroom.
                    Te contactaremos para coordinar el retiro.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="pt-4 border-t border-[var(--color-border-base)]/30">
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-lg font-semibold text-[var(--color-border-base)]"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Total a pagar:
              </span>
              <span
                className="text-2xl font-bold text-[var(--color-border-base)]"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                {formatCurrency(totalAmount)}
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={
                  currentStep === "delivery"
                    ? onClose
                    : currentStep === "form"
                    ? handleBackToDelivery
                    : handleBackToForm
                }
                className="flex-1"
                disabled={isSubmitting}
              >
                {currentStep === "delivery" ? "Cancelar" : "Atrás"}
              </Button>
              <Button
                type="submit"
                className="flex-1 hover:bg-[var(--color-bouncy-lemon)] hover:border-[var(--color-bouncy-lemon)] hover:text-[var(--color-contrast-base)]"
                disabled={
                  isSubmitting ||
                  (currentStep === "delivery" && !deliveryMethod) ||
                  (currentStep === "payment" && !selectedPaymentMethod) ||
                  (currentStep === "payment" &&
                    selectedPaymentMethod === "transfer" &&
                    !proofFile)
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : currentStep === "delivery" ? (
                  "Continuar"
                ) : currentStep === "form" ? (
                  "Continuar"
                ) : (
                  "Confirmar pago"
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
