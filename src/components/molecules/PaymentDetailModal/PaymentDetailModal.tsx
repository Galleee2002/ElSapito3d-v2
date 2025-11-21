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
  Trash2,
  Download,
  Image as ImageIcon,
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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
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
  const { toast } = useToast();
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
    const approvePromise = paymentsService.updatePaymentStatus(
      currentPayment.id,
      "aprobado",
      currentPayment.notes || undefined
    );

    toast.promise<Payment | null>(approvePromise, {
      loading: "Aprobando pago...",
      success: (updatedPayment) => {
        if (updatedPayment) {
          setCurrentPayment(updatedPayment);
          onPaymentUpdated?.();
          return "Pago aprobado exitosamente. El cliente recibirá una notificación en tiempo real.";
        }
        return "No se pudo aprobar el pago. Intenta nuevamente.";
      },
      error: (error) =>
        error instanceof Error
          ? error.message
          : "Ocurrió un error al aprobar el pago. Intenta nuevamente.",
    });

    try {
      await approvePromise;
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!currentPayment || !user?.isAdmin) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer.\n\nPago: ${formatCurrency(currentPayment.amount)}\nCliente: ${currentPayment.customer_name}`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    const deletePromise = paymentsService.delete(currentPayment.id);

    toast.promise(deletePromise, {
      loading: "Eliminando pago...",
      success: () => {
        onPaymentUpdated?.();
        onClose();
        return "Pago eliminado exitosamente.";
      },
      error: (error) =>
        error instanceof Error
          ? error.message
          : "Ocurrió un error al eliminar el pago. Intenta nuevamente.",
    });

    try {
      await deletePromise;
    } finally {
      setIsDeleting(false);
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
            className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[var(--color-toad-eyes)] bg-white text-[var(--color-toad-eyes)] transition-all cursor-pointer hover:bg-[var(--color-toad-eyes)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-toad-eyes)]"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
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
            <div className="flex items-center gap-3 flex-wrap">
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
                  disabled={isApproving || isDeleting}
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
              {isAdmin && (
                <Button
                  variant="secondary"
                  onClick={handleDeletePayment}
                  disabled={isDeleting || isApproving}
                  className="text-sm px-4 py-2 bg-[var(--color-toad-eyes)] hover:bg-[var(--color-toad-eyes)]/90 text-white border-0"
                >
                  {isDeleting ? (
                    <>
                      <Spinner size="sm" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Eliminar Pago
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

          {/* Productos Comprados */}
          {currentPayment.metadata && 'items' in currentPayment.metadata && Array.isArray(currentPayment.metadata.items) && currentPayment.metadata.items.length > 0 && (
            <div className="mb-6">
              <h3
                className="text-base sm:text-lg font-bold mb-3 text-[var(--color-contrast-base)]"
                style={{ fontFamily: "var(--font-baloo)" }}
              >
                Productos Comprados
              </h3>
              <div className="space-y-3">
                {((currentPayment.metadata.items as unknown) as Array<{
                  id?: string;
                  title?: string;
                  quantity?: number;
                  unit_price?: number;
                  selectedColors?: Array<{ name: string; code: string }>;
                }>).map((item, index) => {
                  const colors = Array.isArray(item.selectedColors) ? item.selectedColors : [];
                  const hasColors = colors.length > 0;
                  
                  return (
                    <div
                      key={item.id || index}
                      className="p-3 rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {item.title || "Producto sin nombre"}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-600">
                              Cantidad: <span className="font-semibold">{item.quantity || 0}</span>
                            </span>
                            {item.unit_price && (
                              <span className="text-xs text-gray-600">
                                Precio unitario: <span className="font-semibold">{formatCurrency(item.unit_price)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        {item.quantity && item.unit_price && (
                          <p className="text-sm font-bold text-[var(--color-frog-green)] whitespace-nowrap">
                            {formatCurrency(item.quantity * item.unit_price)}
                          </p>
                        )}
                      </div>
                      {hasColors ? (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-1.5">Colores seleccionados:</p>
                          <div className="flex flex-wrap gap-2">
                            {colors.map((color, colorIndex) => (
                              <div
                                key={colorIndex}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-gray-200"
                              >
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                                  style={{ backgroundColor: color.code || "#ccc" }}
                                  aria-label={`Color ${color.name || "Sin nombre"}`}
                                />
                                <span className="text-xs font-medium text-gray-700">
                                  {color.name || "Sin nombre"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-400 italic">
                            Sin colores seleccionados
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                value={PAYMENT_METHOD_LABELS[currentPayment.payment_method] || currentPayment.payment_method}
              />
              <InfoItem
                icon={<Calendar />}
                label="Fecha"
                value={formatDate(currentPayment.payment_date)}
              />
              {(() => {
                if (
                  currentPayment.metadata &&
                  typeof currentPayment.metadata === 'object' &&
                  'delivery_method' in currentPayment.metadata &&
                  currentPayment.metadata.delivery_method
                ) {
                  const deliveryMethod = String(currentPayment.metadata.delivery_method);
                  const displayValue =
                    deliveryMethod === "pickup"
                      ? "Retiro en Showroom"
                      : deliveryMethod === "shipping"
                      ? "Envío a Domicilio"
                      : deliveryMethod;
                  
                  return (
                    <InfoItem
                      icon={<MapPin />}
                      label="Método de Entrega"
                      value={displayValue}
                    />
                  );
                }
                return null;
              })()}
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

          {/* Comprobante de Transferencia */}
          {currentPayment.transfer_proof_url && (
            <div className="mb-6">
              <h3
                className="text-base sm:text-lg font-bold mb-3 text-[var(--color-contrast-base)]"
                style={{ fontFamily: "var(--font-baloo)" }}
              >
                Comprobante de Transferencia
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {currentPayment.transfer_proof_url.toLowerCase().endsWith('.pdf') ? (
                      <FileText className="w-8 h-8 text-red-600" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-blue-600" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Comprobante de pago
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentPayment.transfer_proof_url.toLowerCase().endsWith('.pdf') ? 'Documento PDF' : 'Imagen'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={currentPayment.transfer_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-2",
                        "px-3 py-2 rounded-lg",
                        "bg-[var(--color-frog-green)] text-white",
                        "hover:bg-[var(--color-frog-green)]/90",
                        "transition-colors",
                        "text-sm font-semibold"
                      )}
                    >
                      <Download className="w-4 h-4" />
                      Ver
                    </a>
                  </div>
                </div>
                {!currentPayment.transfer_proof_url.toLowerCase().endsWith('.pdf') && (
                  <div className="mt-3">
                    <img
                      src={currentPayment.transfer_proof_url}
                      alt="Comprobante de transferencia"
                      className="w-full max-h-64 object-contain rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

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

