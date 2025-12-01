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
  storageService,
  supabase,
} from "@/services";
import { useCart } from "@/hooks";
import { useToast } from "@/hooks/useToast";
import { formatCurrency, mapCartItemsToPaymentItems, buildCustomerAddress, validateEmail } from "@/utils";
import { PAYMENT_DISCOUNT_TRANSFER, PAYMENT_SURCHARGE_MERCADO_PAGO } from "@/constants";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete?: () => void;
}

interface FormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_instagram: string;
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
  customer_instagram?: string;
  customer_address?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  deliveryMethod?: string;
  paymentMethod?: string;
}

const CheckoutModal = ({ isOpen, onClose, onPurchaseComplete }: CheckoutModalProps) => {
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
    customer_instagram: "",
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
        customer_instagram: "",
        customer_address: "",
        street: "",
        city: "",
        postalCode: "",
        province: "",
      });
      setErrors({});
    }
  }, [isOpen]);


  if (!isOpen) return null;

  const getAdjustedTotalAmount = (method: PaymentMethodType | null): number => {
    if (!method) {
      return totalAmount;
    }

    if (method === "mercado_pago") {
      return totalAmount * (1 + PAYMENT_SURCHARGE_MERCADO_PAGO);
    }

    if (method === "transfer") {
      return totalAmount * (1 - PAYMENT_DISCOUNT_TRANSFER);
    }

    return totalAmount;
  };

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
    } else if (!validateEmail(formData.customer_email)) {
      newErrors.customer_email = "El email no es válido";
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = "El teléfono es requerido";
    }

    if (!formData.customer_instagram.trim()) {
      newErrors.customer_instagram = "El Instagram es requerido";
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
    }

    const productsWithoutColors = items.filter((item) => {
      const colorMode = item.product.colorMode ?? "default";
      const hasColors = item.selectedColors && item.selectedColors.length > 0;
      const hasSections =
        item.selectedSections && item.selectedSections.length > 0;

      if (colorMode === "disabled") {
        return false;
      }

      if (colorMode === "sections") {
        return !hasSections;
      }

      return !hasColors;
    });

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

  const normalizePhone = (phone: string): string => {
    return phone.replace(/\D/g, "");
  };

  const handleSubmitMercadoPago = async () => {
    setIsSubmitting(true);

    try {
      const mpItems = mapCartItemsToPaymentItems(items);
      const address = buildCustomerAddress(formData, deliveryMethod);
      const normalizedPhone = normalizePhone(formData.customer_phone.trim());

      const response = await mercadoPagoService.createPaymentPreference({
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        customer_phone: normalizedPhone,
        customer_instagram: formData.customer_instagram.trim(),
        customer_address: address,
        amount: getAdjustedTotalAmount("mercado_pago"),
        items: mpItems,
        delivery_method: deliveryMethod || undefined,
      });

      if (response.success && response.preference?.init_point) {
        clearCart();
        toast.success("Redirigiendo a Mercado Pago...");
        
        setTimeout(() => {
          try {
            mercadoPagoService.redirectToCheckout(response.preference.init_point);
          } catch (redirectError) {
            console.error("Error al redirigir:", redirectError);
            toast.error(
              redirectError instanceof Error
                ? redirectError.message
                : "Error al redirigir a Mercado Pago. Por favor, intenta nuevamente."
            );
            setIsSubmitting(false);
          }
        }, 500);
      } else {
        throw new Error("No se pudo crear la preferencia de pago. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error en handleSubmitMercadoPago:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al procesar el pago. Intenta nuevamente."
      );
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

      const mpItems = mapCartItemsToPaymentItems(items);
      const address = buildCustomerAddress(formData, deliveryMethod);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase configuration missing");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || supabaseAnonKey;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-transfer-payment?v=${Date.now()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customer_name: formData.customer_name.trim(),
            customer_email: formData.customer_email.trim(),
            customer_phone: formData.customer_phone.trim(),
            customer_instagram: formData.customer_instagram.trim(),
            customer_address: address,
            amount: getAdjustedTotalAmount("transfer"),
            transfer_proof_url: uploadResult.url,
            notes: `Pago por transferencia - ${deliveryMethod === "pickup" ? "Retiro en showroom" : "Envío a domicilio"} - Pendiente de verificación`,
            metadata: {
              items: mpItems,
              currency: "ARS",
              delivery_method: deliveryMethod,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Error desconocido" }));
        const errorMessage =
          errorData.error ||
          `Error al crear el pago: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      clearCart();
      toast.success(
        "Tu pedido ha sido registrado. Te contactaremos una vez verifiquemos el pago."
      );
      onClose();
      if (deliveryMethod === "shipping") {
        onPurchaseComplete?.();
      }
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

  const displayTotalAmount =
    currentStep === "payment"
      ? getAdjustedTotalAmount(selectedPaymentMethod)
      : totalAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl border border-[var(--color-border-base)]/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-white border-b border-[var(--color-border-base)]/30 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-border-base)] font-baloo">
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
            className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[var(--color-toad-eyes)] bg-white text-[var(--color-toad-eyes)] transition-all cursor-pointer hover:bg-[var(--color-toad-eyes)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toad-eyes)]"
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

              <div>
                <label
                  htmlFor="customer_instagram"
                  className="block text-sm font-semibold text-[var(--color-border-base)] mb-2"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  Instagram * (@usuario)
                </label>
                <input
                  id="customer_instagram"
                  type="text"
                  value={formData.customer_instagram}
                  onChange={(e) =>
                    handleChange("customer_instagram", e.target.value)
                  }
                  className={`w-full px-4 py-2 border rounded-xl ${
                    errors.customer_instagram
                      ? "border-red-500/60"
                      : "border-[var(--color-border-base)]/30"
                  } focus:outline-none focus:ring-1 focus:ring-[var(--color-border-base)]/50 focus:border-[var(--color-border-base)]/60`}
                  style={{ fontFamily: "var(--font-nunito)" }}
                  placeholder="@usuario"
                  disabled={isSubmitting}
                />
                {errors.customer_instagram && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.customer_instagram}
                  </p>
                )}
              </div>

              {deliveryMethod === "shipping" && (
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
                {formatCurrency(displayTotalAmount)}
              </span>
            </div>

            {currentStep === "payment" && selectedPaymentMethod && (
              <p
                className="text-xs text-gray-600 mb-4"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                {selectedPaymentMethod === "mercado_pago"
                  ? "Incluye un 10% de recargo por pago con Mercado Pago."
                  : "Incluye un 5% de descuento por pago con transferencia."}
              </p>
            )}

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
