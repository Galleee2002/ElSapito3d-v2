import { useState, useEffect } from "react";
import { X, User, Mail, Phone, MapPin, CreditCard, Calendar, FileText, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal, Badge, Spinner } from "@/components";
import { cn } from "@/utils";
import { motionVariants } from "@/constants";
import { paymentsService } from "@/services";
import type { Payment } from "@/types";

interface PaymentDetailModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

const paymentMethodLabels: Record<string, string> = {
  mercado_pago: "Mercado Pago",
  tarjeta_credito: "Tarjeta de Crédito",
  tarjeta_debito: "Tarjeta de Débito",
  transferencia: "Transferencia",
  efectivo: "Efectivo",
  otro: "Otro",
};

const statusColors: Record<string, string> = {
  aprobado: "bg-green-100 text-green-700 border-green-300",
  pendiente: "bg-yellow-100 text-yellow-700 border-yellow-300",
  rechazado: "bg-red-100 text-red-700 border-red-300",
  cancelado: "bg-gray-100 text-gray-700 border-gray-300",
  reembolsado: "bg-blue-100 text-blue-700 border-blue-300",
};

const statusLabels: Record<string, string> = {
  aprobado: "Aprobado",
  pendiente: "Pendiente",
  rechazado: "Rechazado",
  cancelado: "Cancelado",
  reembolsado: "Reembolsado",
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount);
};

const PaymentDetailModal = ({
  payment,
  isOpen,
  onClose,
}: PaymentDetailModalProps) => {
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (payment && isOpen) {
      const loadHistory = async () => {
        setIsLoadingHistory(true);
        try {
          const history = await paymentsService.getCustomerPaymentHistory(
            payment.customer_email
          );
          setPaymentHistory(history.filter((p) => p.id !== payment.id));
        } catch (error) {
          console.error("Error al cargar historial:", error);
        } finally {
          setIsLoadingHistory(false);
        }
      };
      void loadHistory();
    }
  }, [payment, isOpen]);

  if (!payment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={motionVariants.spring}
        className={cn(
          "bg-white rounded-2xl",
          "w-full max-w-2xl max-h-[90vh]",
          "overflow-hidden",
          "shadow-2xl"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 border-[var(--color-border-blue)] bg-[var(--color-frog-green)]">
          <h2
            className="text-lg sm:text-xl font-bold text-white"
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
              "focus:outline-none focus:ring-2 focus:ring-white"
            )}
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Estado y Monto */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-1">Monto Total</p>
              <p className="text-2xl sm:text-3xl font-bold text-[var(--color-frog-green)]">
                {formatAmount(payment.amount)}
              </p>
            </div>
            <Badge
              className={cn(
                "text-sm font-semibold px-3 py-1.5 rounded-full border",
                statusColors[payment.payment_status]
              )}
            >
              {statusLabels[payment.payment_status]}
            </Badge>
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
              <InfoItem icon={<User />} label="Nombre" value={payment.customer_name} />
              <InfoItem icon={<Mail />} label="Email" value={payment.customer_email} />
              {payment.customer_phone && (
                <InfoItem icon={<Phone />} label="Teléfono" value={payment.customer_phone} />
              )}
              {payment.customer_address && (
                <InfoItem
                  icon={<MapPin />}
                  label="Dirección"
                  value={payment.customer_address}
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
                value={paymentMethodLabels[payment.payment_method]}
              />
              <InfoItem
                icon={<Calendar />}
                label="Fecha"
                value={formatDate(payment.payment_date)}
              />
              <InfoItem
                icon={<FileText />}
                label="ID del Pago"
                value={payment.id.slice(0, 12) + "..."}
                fullWidth
              />
              {payment.mp_payment_id && (
                <InfoItem
                  icon={<FileText />}
                  label="ID Mercado Pago"
                  value={payment.mp_payment_id}
                  fullWidth
                />
              )}
              {payment.order_id && (
                <InfoItem
                  icon={<FileText />}
                  label="ID de Orden"
                  value={payment.order_id}
                  fullWidth
                />
              )}
            </div>
          </div>

          {/* Notas */}
          {payment.notes && (
            <div className="mb-6">
              <h3
                className="text-base sm:text-lg font-bold mb-3 text-[var(--color-contrast-base)]"
                style={{ fontFamily: "var(--font-baloo)" }}
              >
                Notas
              </h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {payment.notes}
              </p>
            </div>
          )}

          {/* Historial de Compras */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-[var(--color-border-blue)]" />
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
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {paymentHistory.map((historyPayment) => (
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
                          {formatAmount(historyPayment.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(historyPayment.payment_date)}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full border whitespace-nowrap",
                          statusColors[historyPayment.payment_status]
                        )}
                      >
                        {statusLabels[historyPayment.payment_status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
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
    <div className="text-[var(--color-border-blue)] mt-0.5">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-900 break-words">{value}</p>
    </div>
  </div>
);

export default PaymentDetailModal;

