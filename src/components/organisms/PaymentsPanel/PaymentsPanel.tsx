import { useState, useEffect } from "react";
import { X, CreditCard, DollarSign, TrendingUp, RefreshCw, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils";
import { motionVariants } from "@/constants";
import {
  SearchBar,
  PaymentFilters,
  PaymentTable,
  PaymentDetailModal,
} from "@/components";
import { usePayments } from "@/hooks";
import { paymentsService } from "@/services";
import type { Payment } from "@/types";

interface PaymentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentsPanel = ({ isOpen, onClose }: PaymentsPanelProps) => {
  const {
    payments,
    statistics,
    isLoading,
    currentPage,
    totalPages,
    totalCount,
    filters,
    updateSearch,
    updateStatusFilter,
    resetFilters,
    goToPage,
    refresh,
  } = usePayments();

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setTimeout(() => setSelectedPayment(null), 300);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPaymentMethod = (method: string) => {
    const methods: Record<string, string> = {
      mercado_pago: "Mercado Pago",
      tarjeta_credito: "Tarjeta de Crédito",
      tarjeta_debito: "Tarjeta de Débito",
      transferencia: "Transferencia",
      efectivo: "Efectivo",
      otro: "Otro",
    };
    return methods[method] || method;
  };

  const formatPaymentStatus = (status: string) => {
    const statuses: Record<string, string> = {
      aprobado: "Aprobado",
      pendiente: "Pendiente",
      rechazado: "Rechazado",
      cancelado: "Cancelado",
      reembolsado: "Reembolsado",
    };
    return statuses[status] || status;
  };

  const handleExportReport = async () => {
    try {
      const { data: allPayments } = await paymentsService.getAll(
        filters,
        10000,
        0
      );

      if (!allPayments || allPayments.length === 0) {
        return;
      }

      const headers = [
        "ID",
        "Cliente",
        "Email",
        "Teléfono",
        "Dirección",
        "Monto",
        "Método de Pago",
        "Estado",
        "Fecha de Pago",
        "Fecha de Creación",
        "Notas",
      ];

      const rows = allPayments.map((payment) => [
        payment.id,
        payment.customer_name,
        payment.customer_email,
        payment.customer_phone || "",
        payment.customer_address || "",
        payment.amount.toString(),
        formatPaymentMethod(payment.payment_method),
        formatPaymentStatus(payment.payment_status),
        new Date(payment.payment_date).toLocaleString("es-AR"),
        new Date(payment.created_at).toLocaleString("es-AR"),
        payment.notes || "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `reporte-pagos-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al exportar reporte:", error);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[65]"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={motionVariants.springSoft}
              className={cn(
                "fixed top-0 left-0 bottom-0 z-[70]",
                "w-full max-w-xs sm:max-w-sm md:max-w-3xl lg:max-w-5xl xl:max-w-6xl",
                "bg-white border-r-2 border-[var(--color-border-blue)]",
                "shadow-2xl",
                "flex flex-col",
                "overflow-hidden"
              )}
              role="complementary"
              aria-label="Panel de pagos"
            >
              {/* Header */}
              <div
                className={cn(
                  "flex items-center justify-between",
                  "p-4 sm:p-5",
                  "border-b-2 border-[var(--color-border-blue)]",
                  "bg-[var(--color-frog-green)]",
                  "flex-shrink-0"
                )}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={cn(
                      "p-1.5 sm:p-2 rounded-full",
                      "bg-white/20 backdrop-blur-sm"
                    )}
                  >
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h2
                    className="text-lg sm:text-xl font-bold text-white"
                    style={{ fontFamily: "var(--font-baloo)" }}
                  >
                    Panel de Pagos
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={() => void refresh()}
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "p-2 rounded-full",
                      "hover:bg-white/20",
                      "transition-colors duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--color-frog-green)]"
                    )}
                    aria-label="Refrescar"
                  >
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </motion.button>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar panel de pagos"
                    className={cn(
                      "p-2 rounded-full",
                      "hover:bg-white/20",
                      "transition-colors duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--color-frog-green)]"
                    )}
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              {statistics && (
                <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div
                      className={cn(
                        "p-3 sm:p-4 rounded-xl",
                        "bg-white/60 backdrop-blur-md",
                        "border-2 border-[var(--color-border-blue)]"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                        <span className="text-xs sm:text-sm font-semibold text-black">
                          Total Mes
                        </span>
                      </div>
                      <p className="text-lg sm:text-2xl font-bold text-black">
                        {formatCurrency(statistics.current_month_approved_amount)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-black/80 mt-1">
                        {statistics.current_month_approved_count} pago(s)
                      </p>
                    </div>

                    <div
                      className={cn(
                        "p-3 sm:p-4 rounded-xl",
                        "bg-white/60 backdrop-blur-md",
                        "border-2 border-[var(--color-border-blue)]"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                        <span className="text-xs sm:text-sm font-semibold text-black">
                          Aprobados
                        </span>
                      </div>
                      <p className="text-lg sm:text-2xl font-bold text-black">
                        {statistics.approved_count}
                      </p>
                      <p className="text-[10px] sm:text-xs text-black/80 mt-1">
                        {formatCurrency(statistics.total_approved_amount)}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "p-3 sm:p-4 rounded-xl col-span-2 lg:col-span-1",
                        "bg-white/60 backdrop-blur-md",
                        "border-2 border-[var(--color-border-blue)]"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                        <span className="text-xs sm:text-sm font-semibold text-black">
                          Pendientes
                        </span>
                      </div>
                      <p className="text-lg sm:text-2xl font-bold text-black">
                        {statistics.pending_count}
                      </p>
                      <p className="text-[10px] sm:text-xs text-black/80 mt-1">
                        {formatCurrency(statistics.total_pending_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="p-4 sm:p-5 border-b border-gray-200 flex-shrink-0">
                <div className="flex flex-col gap-3">
                  <SearchBar
                    value={filters.search || ""}
                    onChange={updateSearch}
                    placeholder="Buscar por nombre o email..."
                  />
                  <PaymentFilters
                    statusFilter={filters.status || "all"}
                    onStatusChange={updateStatusFilter}
                    onReset={resetFilters}
                  />
                </div>
              </div>

              {/* Content - Tabla con Scroll */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                <PaymentTable
                  payments={payments}
                  isLoading={isLoading}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  onPageChange={goToPage}
                  onViewDetails={handleViewDetails}
                />
              </div>

              {/* Footer */}
              <div
                className={cn(
                  "p-4 sm:p-5",
                  "border-t-2 border-[var(--color-border-blue)]",
                  "bg-gray-50",
                  "flex-shrink-0",
                  "overflow-hidden"
                )}
              >
                <motion.button
                  type="button"
                  onClick={() => void handleExportReport()}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full px-5 py-2.5 sm:px-6 sm:py-3 rounded-full",
                    "bg-[var(--color-border-blue)] border-2 border-[var(--color-border-blue)] text-white",
                    "hover:bg-[var(--color-bouncy-lemon)] hover:border-[var(--color-bouncy-lemon)] hover:text-[var(--color-contrast-base)]",
                    "font-bold text-sm sm:text-base",
                    "transition-all duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--color-border-blue)] focus:ring-offset-2"
                  )}
                >
                  <Download className="w-4 h-4" />
                  Exportar Reporte
                </motion.button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Detalles */}
      <PaymentDetailModal
        payment={selectedPayment}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onPaymentUpdated={() => {
          void refresh();
        }}
      />
    </>
  );
};

export default PaymentsPanel;
