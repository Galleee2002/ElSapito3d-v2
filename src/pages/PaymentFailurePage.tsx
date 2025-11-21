import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Navbar, Button } from "@/components";
import { paymentsService } from "@/services";

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

  const getTitle = () => {
    if (status === "cancelled") {
      return "Pago Cancelado";
    }
    return "Pago Rechazado";
  };

  const getMessage = () => {
    if (status === "cancelled") {
      return "El pago fue cancelado. Puedes intentar nuevamente cuando estés listo.";
    }
    return "No pudimos procesar tu pago. Por favor, verifica los datos de tu tarjeta o intenta con otro método de pago.";
  };

  return (
    <div className="min-h-screen bg-bg text-text-main">
      <Navbar />
      <div className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-14 md:pb-16 px-4 sm:px-5 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface rounded-3xl border border-border-base p-8 sm:p-10 text-center shadow-sm">
            <div className="flex justify-center mb-6">
              <div
                className="p-4 rounded-full"
                style={{
                  backgroundColor: "rgba(226, 60, 60, 0.15)",
                  border: "2px solid #e23c3c",
                }}
              >
                <XCircle
                  className="w-16 h-16 icon-error"
                  strokeWidth={2.5}
                  style={{ color: "#e23c3c" }}
                />
              </div>
            </div>

            <h1
              className="text-3xl sm:text-4xl font-bold mb-4 text-error"
              style={{ fontFamily: "var(--font-baloo)" }}
            >
              {getTitle()}
            </h1>

            <p
              className="text-lg text-text-muted mb-8"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              {getMessage()}
            </p>

            {isUpdating && (
              <p
                className="text-sm text-text-muted mb-4"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Actualizando estado del pago...
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => (window.location.href = "/carrito")}>
                Volver al carrito
              </Button>
              <Button
                variant="secondary"
                onClick={() => (window.location.href = "/productos")}
              >
                Ver productos
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;
