import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button, PaymentStatusPage } from "@/components";
import { paymentsService } from "@/services";
import { navigateTo, NAVIGATION_PATHS } from "@/utils";

const PaymentFailurePage = () => {
  const [searchParams] = useSearchParams();
  const [isUpdating, setIsUpdating] = useState(false);
  const status = searchParams.get("status");
  const paymentId = searchParams.get("payment_id");
  const externalReference = searchParams.get("external_reference");

  useEffect(() => {
    const updatePaymentStatus = async () => {
      if (!externalReference) return;

      setIsUpdating(true);
      try {
        const finalStatus = status === "cancelled" ? "cancelado" : "rechazado";
        await paymentsService.updatePaymentStatusByExternalReference(
          externalReference,
          finalStatus,
          paymentId || undefined
        );
      } catch (error) {
        console.error("Error al actualizar estado del pago:", error);
      } finally {
        setIsUpdating(false);
      }
    };

    void updatePaymentStatus();
  }, [externalReference, status, paymentId]);

  const isCancelled = status === "cancelled";
  const title = isCancelled ? "Pago Cancelado" : "Pago Rechazado";
  const message = isCancelled
    ? "El pago fue cancelado. Puedes intentar nuevamente cuando estés listo."
    : "No pudimos procesar tu pago. Por favor, verifica los datos de tu tarjeta o intenta con otro método de pago.";

  return (
    <PaymentStatusPage
      icon={<XCircle className="w-16 h-16 icon-error" strokeWidth={2.5} />}
      title={title}
      message={message}
      iconBgColor="rgba(226, 60, 60, 0.15)"
      iconBorderColor="#e23c3c"
      iconColor="#e23c3c"
      additionalContent={
        isUpdating && (
          <p
            className="text-sm text-text-muted mb-4"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Actualizando estado del pago...
          </p>
        )
      }
      actions={
        <>
          <Button onClick={() => navigateTo(NAVIGATION_PATHS.CART)}>
            Volver al carrito
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigateTo(NAVIGATION_PATHS.PRODUCTS)}
          >
            Ver productos
          </Button>
        </>
      }
    />
  );
};

export default PaymentFailurePage;
