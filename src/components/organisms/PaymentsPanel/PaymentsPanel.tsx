import { useState, useEffect, useCallback } from "react";
import {
  X,
  CreditCard,
  RefreshCw,
  Download,
  Calendar,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency, formatDate, getDeliveryMethodDisplay } from "@/utils";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/constants";
import {
  SearchBar,
  PaymentFilters,
  PaymentTable,
  PaymentDetailModal,
  CurrentMonthSummary,
  MonthlyHistory,
} from "@/components";
import { useCurrentMonthPayments, useMonthlyHistory } from "@/hooks";
import { useToast } from "@/hooks/useToast";
import { paymentsService } from "@/services";
import type { Payment } from "@/types";

type TabType = "current" | "history";

interface PaymentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentsPanel = ({ isOpen, onClose }: PaymentsPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("current");
  const { toast } = useToast();

  const {
    payments: currentMonthPayments,
    statistics: currentMonthStatistics,
    isLoading: isLoadingCurrentMonth,
    currentPage,
    totalPages,
    totalCount,
    filters,
    updateSearch,
    updateStatusFilter,
    resetFilters,
    goToPage,
    refresh: refreshCurrentMonth,
  } = useCurrentMonthPayments(isOpen && activeTab === "current");

  const {
    monthlyHistory,
    isLoading: isLoadingHistory,
    refresh: refreshHistory,
  } = useMonthlyHistory(isOpen && activeTab === "history");

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

  const handleViewDetails = useCallback((payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setTimeout(() => setSelectedPayment(null), 300);
  }, []);

  const handleRefresh = useCallback(() => {
    if (activeTab === "current") {
      void refreshCurrentMonth();
    } else {
      void refreshHistory();
    }
  }, [activeTab, refreshCurrentMonth, refreshHistory]);

  const handleDeletePayment = useCallback(
    async (payment: Payment) => {
      const confirmed = window.confirm(
        `¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer.\n\nPago: ${formatCurrency(
          payment.amount
        )}\nCliente: ${payment.customer_name}`
      );

      if (!confirmed) return;

      const deletePromise = paymentsService.delete(payment.id);

      toast.promise(deletePromise, {
        loading: "Eliminando pago...",
        success: () => {
          void refreshCurrentMonth();
          void refreshHistory();
          return "Pago eliminado exitosamente.";
        },
        error: (error) =>
          error instanceof Error
            ? error.message
            : "Ocurrió un error al eliminar el pago. Intenta nuevamente.",
      });

      try {
        await deletePromise;
      } catch {
        // Error manejado por toast.promise
      }
    },
    [refreshCurrentMonth, refreshHistory, toast]
  );

  const handleExportReport = useCallback(async () => {
    try {
      const { data: allPayments } =
        activeTab === "current"
          ? await paymentsService.getCurrentMonthPayments(filters, 10000, 0)
          : await paymentsService.getAll({}, 10000, 0);

      if (!allPayments || allPayments.length === 0) {
        toast.error("No hay pagos para exportar.");
        return;
      }

      const [{ default: JsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const headers = [
        "ID",
        "Cliente",
        "Email",
        "Teléfono",
        "Dirección",
        "Monto",
        "Método de Pago",
        "Entrega",
        "Estado",
        "Fecha de Pago",
        "Fecha de Creación",
        "Notas",
      ];

      const rows = allPayments.map((payment) => {
        const deliveryMethod = getDeliveryMethodDisplay(payment.metadata);

        return [
          payment.id,
          payment.customer_name,
          payment.customer_email,
          payment.customer_phone || "N/A",
          payment.customer_address || "N/A",
          formatCurrency(payment.amount),
          PAYMENT_METHOD_LABELS[payment.payment_method] ||
            payment.payment_method,
          deliveryMethod,
          PAYMENT_STATUS_LABELS[payment.payment_status] ||
            payment.payment_status,
          formatDate(payment.payment_date),
          formatDate(payment.created_at),
          payment.notes || "Sin notas",
        ];
      });

      const doc = new JsPDF({ orientation: "landscape", unit: "pt" });
      const titleY = 40;
      doc.setFontSize(18);
      doc.text("Reporte de Pagos", 40, titleY);
      doc.setFontSize(10);
      doc.text(
        `Generado: ${new Date().toLocaleString("es-AR", {
          dateStyle: "medium",
          timeStyle: "short",
        })}`,
        40,
        titleY + 18
      );
      doc.text(`Total registros: ${rows.length}`, 40, titleY + 32);

      autoTable(doc, {
        startY: titleY + 48,
        head: [headers],
        body: rows,
        styles: {
          fontSize: 8,
          cellPadding: 6,
          minCellHeight: 18,
          valign: "middle",
        },
        headStyles: {
          fillColor: [38, 78, 49],
          textColor: 255,
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [245, 247, 245],
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 120 },
          2: { cellWidth: 130 },
          3: { cellWidth: 90 },
          4: { cellWidth: 130 },
          5: { cellWidth: 70 },
          6: { cellWidth: 90 },
          7: { cellWidth: 90 },
          8: { cellWidth: 80 },
          9: { cellWidth: 90 },
          10: { cellWidth: 90 },
          11: { cellWidth: 140 },
        },
        didDrawPage: (data) => {
          const pageHeight = doc.internal.pageSize.getHeight();
          const totalPages = doc.internal.pages.length;
          doc.setFontSize(9);
          doc.text(
            `Página ${totalPages}`,
            data.settings.margin.left,
            pageHeight - 20
          );
        },
      });

      const reportName =
        activeTab === "current"
          ? `reporte-pagos-mes-actual-${
              new Date().toISOString().split("T")[0]
            }.pdf`
          : `reporte-pagos-historico-${
              new Date().toISOString().split("T")[0]
            }.pdf`;

      doc.save(reportName);
      toast.success("Reporte PDF descargado correctamente.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo generar el reporte en PDF.";
      toast.error(message);
    }
  }, [activeTab, filters, toast]);

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
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ willChange: "opacity" }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[65]"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "tween",
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
              }}
              style={{ willChange: "transform" }}
              className={cn(
                "fixed top-0 left-0 bottom-0 z-[70]",
                "w-full max-w-xs sm:max-w-sm md:max-w-3xl lg:max-w-5xl xl:max-w-6xl",
                "bg-white border-r-2 border-[var(--color-border-base)]",
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
                  "border-b-2 border-[var(--color-border-base)]",
                  "bg-white",
                  "flex-shrink-0"
                )}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={cn("p-1.5 sm:p-2 rounded-full")}>
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-black font-baloo">
                    Panel de Pagos
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={handleRefresh}
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={cn(
                      "p-2 rounded-full",
                      "hover:bg-gray-100",
                      "transition-colors duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    )}
                    aria-label="Refrescar"
                  >
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                  </motion.button>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar panel de pagos"
                    className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-black bg-white text-black transition-all cursor-pointer hover:bg-[var(--color-toad-eyes)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b-2 border-[var(--color-border-base)] bg-white flex-shrink-0">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setActiveTab("current")}
                    className={cn(
                      "flex-1 px-4 py-3 text-sm sm:text-base font-semibold",
                      "transition-colors duration-200",
                      "flex items-center justify-center gap-2",
                      "border-r border-[var(--color-border-base)]",
                      "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-transparent",
                      activeTab === "current"
                        ? "bg-white text-black"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <Clock className="w-4 h-4" />
                    Mes Actual
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("history")}
                    className={cn(
                      "flex-1 px-4 py-3 text-sm sm:text-base font-semibold",
                      "transition-colors duration-200",
                      "flex items-center justify-center gap-2",
                      "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-transparent",
                      activeTab === "history"
                        ? "bg-white text-black"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <Calendar className="w-4 h-4" />
                    Historial Mensual
                  </button>
                </div>
              </div>

              {/* Content */}
              {activeTab === "current" ? (
                <>
                  {/* Stats Cards - Mes Actual */}
                  {currentMonthStatistics && (
                    <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                      <CurrentMonthSummary
                        statistics={currentMonthStatistics}
                      />
                    </div>
                  )}

                  {/* Filters - Mes Actual */}
                  <div className="p-4 sm:p-5 border-b border-gray-200 flex-shrink-0">
                    <div className="flex flex-col gap-3">
                      <SearchBar
                        value={filters.search || ""}
                        onChange={updateSearch}
                        placeholder="Buscar en mes actual..."
                      />
                      <PaymentFilters
                        statusFilter={filters.status || "all"}
                        onStatusChange={updateStatusFilter}
                        onReset={resetFilters}
                      />
                    </div>
                  </div>

                  {/* Table - Mes Actual */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                    <PaymentTable
                      payments={currentMonthPayments}
                      isLoading={isLoadingCurrentMonth}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalCount={totalCount}
                      onPageChange={goToPage}
                      onViewDetails={handleViewDetails}
                      onDelete={handleDeletePayment}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Historial Mensual */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                    <MonthlyHistory
                      monthlyHistory={monthlyHistory}
                      isLoading={isLoadingHistory}
                    />
                  </div>
                </>
              )}

              {/* Footer */}
              <div
                className={cn(
                  "p-4 sm:p-5",
                  "border-t-2 border-[var(--color-border-base)]",
                  "bg-gray-50",
                  "flex-shrink-0",
                  "overflow-hidden"
                )}
              >
                <motion.button
                  type="button"
                  onClick={handleExportReport}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full px-5 py-2.5 sm:px-6 sm:py-3 rounded-full",
                    "bg-transparent border-2 border-[var(--color-border-base)] text-black",
                    "hover:bg-[var(--color-bouncy-lemon)] hover:border-[var(--color-bouncy-lemon)] hover:text-[var(--color-contrast-base)]",
                    "font-bold text-sm sm:text-base",
                    "transition-all duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--color-border-base)] focus:ring-offset-2"
                  )}
                >
                  <Download className="w-4 h-4 text-black" />
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
          void refreshCurrentMonth();
          void refreshHistory();
        }}
      />
    </>
  );
};

export default PaymentsPanel;
