import { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Modal, StatusBadge, Spinner, Button } from "@/components";
import { cn, formatCurrency, formatDate } from "@/utils";
import {
  motionVariants,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from "@/constants";
import { paymentsService } from "@/services";
import { useAuth, useToast } from "@/hooks";
import type { Payment } from "@/types";

const HISTORY_PREVIEW_LIMIT = 3;

interface PaymentDetailModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentUpdated?: () => void;
}

const PaymentDetailModal = ({
  payment,
  isOpen,
  onClose,
  onPaymentUpdated,
}: PaymentDetailModalProps) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(payment);
  const [showFullHistory, setShowFullHistory] = useState(false);

  useEffect(() => {
    setCurrentPayment(payment);
  }, [payment]);

  useEffect(() => {
    setShowFullHistory(false);
  }, [currentPayment?.id]);

  useEffect(() => {
    if (currentPayment && isOpen) {
      const loadHistory = async () => {
        setIsLoadingHistory(true);
        try {
          const history = await paymentsService.getCustomerPaymentHistory(
            currentPayment.customer_email
          );
          setPaymentHistory(history.filter((p) => p.id !== currentPayment.id));
        } catch (error) {
          // Error silenciado - no crítico
        } finally {
          setIsLoadingHistory(false);
        }
      };
      void loadHistory();
    }
  }, [currentPayment, isOpen]);

  const handleApprovePayment = async () => {
    if (!currentPayment || !user?.isAdmin) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas aprobar el pago de ${formatCurrency(currentPayment.amount)}? El cliente recibirá una notificación en tiempo real.`
    );

    if (!confirmed) return;

    setIsApproving(true);
    try {
      const updatedPayment = await paymentsService.updatePaymentStatus(
        currentPayment.id,
        "aprobado",
        currentPayment.notes || undefined
      );

      if (updatedPayment) {
        setCurrentPayment(updatedPayment);
        showSuccess("Pago aprobado exitosamente. El cliente recibirá una notificación en tiempo real.");
        onPaymentUpdated?.();
      } else {
        showError("No se pudo aprobar el pago. Intenta nuevamente.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Ocurrió un error al aprobar el pago. Intenta nuevamente.";
      showError(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  if (!currentPayment) return null;

  const isAdmin = user?.isAdmin ?? false;
  const canApprove = isAdmin && currentPayment.payment_status === "pendiente";
  const displayedHistory = showFullHistory
    ? paymentHistory
    : paymentHistory.slice(0, HISTORY_PREVIEW_LIMIT);
  const hasAdditionalHistory = paymentHistory.length > HISTORY_PREVIEW_LIMIT;
  const toggleHistoryView = () => setShowFullHistory((prev) => !prev);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={motionVariants.spring}
        className={cn(
          "flex flex-col",
          "flex-1 min-h-0",
          "overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 border-[var(--color-border-base)] bg-[var(--color-frog-green)] flex-shrink-0">
          <h2
            className="text-lg sm:text-xl font-bold text-black"
            style={{ fontFamily: "var(--font-baloo)" }}
          >
            Detalles del Pago
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "p-2 rounded-full",
              "hover:bg-white/20",
              "transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-black"
            )}
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 min-h-0">
          {/* Estado y Monto */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-1">Monto Total</p>
              <p className="text-2xl sm:text-3xl font-bold text-[var(--color-frog-green)]">
                {formatCurrency(currentPayment.amount)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge
                label={PAYMENT_STATUS_LABELS[currentPayment.payment_status]}
                className={cn(
                  "text-sm font-semibold px-3 py-1.5 rounded-full border",
                  PAYMENT_STATUS_COLORS[currentPayment.payment_status]
                )}
              />
              {canApprove && (
                <Button
                  onClick={handleApprovePayment}
                  disabled={isApproving}
                  className="text-sm px-4 py-2"
                >
                  {isApproving ? (
                    <>
                      <Spinner size="sm" />
                      Aprobando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Aprobar Pago
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="mb-6">
            <h3
              className="text-base sm:text-lg font-bold mb-3 text-[var(--color-contrast-base)]"
              style={{ fontFamily: "var(--font-baloo)" }}
            >
              Información del Cliente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoItem icon={<User />} label="Nombre" value={currentPayment.customer_name} />
              <InfoItem icon={<Mail />} label="Email" value={currentPayment.customer_email} />
              {currentPayment.customer_phone && (
                <InfoItem icon={<Phone />} label="Teléfono" value={currentPayment.customer_phone} />
              )}
              {currentPayment.customer_address && (
                <InfoItem
                  icon={<MapPin />}
                  label="Dirección"
                  value={currentPayment.customer_address}
                  fullWidth
                />
              )}
            </div>
          </div>

          {/* Información del Pago */}
          <div className="mb-6">
            <h3
              className="text-base sm:text-lg font-bold mb-3 text-[var(--color-contrast-base)]"
              style={{ fontFamily: "var(--font-baloo)" }}
            >
              Información del Pago
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoItem
                icon={<CreditCard />}
                label="Método de Pago"
                value={PAYMENT_METHOD_LABELS[currentPayment.payment_method]}
              />
              <InfoItem
                icon={<Calendar />}
                label="Fecha"
                value={formatDate(currentPayment.payment_date)}
              />
              <InfoItem
                icon={<FileText />}
                label="ID del Pago"
                value={currentPayment.id.slice(0, 12) + "..."}
                fullWidth
              />
              {currentPayment.mp_payment_id && (
                <InfoItem
                  icon={<FileText />}
                  label="ID Mercado Pago"
                  value={currentPayment.mp_payment_id}
                  fullWidth
                />
              )}
              {currentPayment.order_id && (
                <InfoItem
                  icon={<FileText />}
                  label="ID de Orden"
                  value={currentPayment.order_id}
                  fullWidth
                />
              )}
            </div>
          </div>

          {/* Notas */}
          {currentPayment.notes && (
            <div className="mb-6">
              <h3
                className="text-base sm:text-lg font-bold mb-3 text-[var(--color-contrast-base)]"
                style={{ fontFamily: "var(--font-baloo)" }}
              >
                Notas
              </h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {currentPayment.notes}
              </p>
            </div>
          )}

          {/* Historial de Compras */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-[var(--color-border-base)]" />
              <h3
                className="text-base sm:text-lg font-bold text-[var(--color-contrast-base)]"
                style={{ fontFamily: "var(--font-baloo)" }}
              >
                Historial de Compras ({paymentHistory.length})
              </h3>
            </div>
            {isLoadingHistory ? (
              <div className="flex justify-center py-4">
                <Spinner size="md" />
              </div>
            ) : paymentHistory.length > 0 ? (
              <>
                <div
                  className={cn(
                    "space-y-2",
                    !showFullHistory && "max-h-48 overflow-hidden"
                  )}
                >
                  {displayedHistory.map((historyPayment) => (
                    <div
                      key={historyPayment.id}
                      className={cn(
                        "p-3 rounded-lg border border-gray-200",
                        "bg-gray-50 hover:bg-gray-100",
                        "transition-colors duration-200"
                      )}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {formatCurrency(historyPayment.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(historyPayment.payment_date)}
                          </p>
                        </div>
                        <StatusBadge
                          label={PAYMENT_STATUS_LABELS[historyPayment.payment_status]}
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full border whitespace-nowrap",
                            PAYMENT_STATUS_COLORS[historyPayment.payment_status]
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {hasAdditionalHistory && (
                  <button
                    type="button"
                    onClick={toggleHistoryView}
                    className="mt-3 text-sm font-semibold text-[var(--color-border-base)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-base)] rounded-full px-2 py-1"
                  >
                    {showFullHistory ? "Ver menos" : "Ver más"}
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay compras anteriores
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </Modal>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  fullWidth?: boolean;
}

const InfoItem = ({ icon, label, value, fullWidth }: InfoItemProps) => (
  <div className={cn("flex gap-2", fullWidth && "sm:col-span-2")}>
    <div className="text-[var(--color-border-base)] mt-0.5">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-900 break-words">{value}</p>
    </div>
  </div>
);

export default PaymentDetailModal;

