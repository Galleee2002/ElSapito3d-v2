import { useState, useCallback } from "react";
import { ChevronDown, ChevronUp, Calendar, DollarSign, TrendingUp, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency, formatMonthYearCapitalized } from "@/utils";
import { useMonthPayments } from "@/hooks";
import { SearchBar, PaymentFilters, PaymentTable, PaymentDetailModal, Spinner } from "@/components";
import { paymentsService } from "@/services";
import { useToast } from "@/hooks/useToast";
import type { MonthlyPaymentSummary, Payment } from "@/types";

interface MonthlyHistoryProps {
  monthlyHistory: MonthlyPaymentSummary[];
  isLoading: boolean;
}

interface MonthAccordionProps {
  summary: MonthlyPaymentSummary;
  onDelete: (payment: Payment) => void;
}

const MonthAccordion = ({ summary, onDelete }: MonthAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    payments,
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
  } = useMonthPayments({
    year: summary.year,
    month: summary.month,
    isEnabled: isOpen,
  });

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleViewDetails = useCallback((payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setTimeout(() => setSelectedPayment(null), 300);
  }, []);

  const handlePaymentUpdated = useCallback(() => {
    void refresh();
  }, [refresh]);

  return (
    <>
      <div
        className={cn(
          "border-2 border-[var(--color-border-base)] rounded-xl overflow-hidden",
          "bg-white"
        )}
      >
        {/* Header */}
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            "w-full p-4 flex items-center justify-between",
            "hover:bg-gray-50 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-frog-green)] focus:ring-inset"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-[var(--color-frog-green)]/10">
              <Calendar className="w-5 h-5 text-[var(--color-frog-green)]" />
            </div>
            <div className="text-left">
              <h3 className="text-base sm:text-lg font-bold text-black">
                {formatMonthYearCapitalized(summary.year, summary.month)}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {summary.total_payments} pago(s)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-sm font-bold text-black">
                  {formatCurrency(summary.total_amount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Aprobados</p>
                <p className="text-sm font-bold text-green-600">
                  {summary.approved_count}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Pendientes</p>
                <p className="text-sm font-bold text-yellow-600">
                  {summary.pending_count}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </motion.div>
          </div>
        </button>

        {/* Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t-2 border-[var(--color-border-base)]">
                {/* Stats Cards Mobile */}
                <div className="sm:hidden p-4 bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <DollarSign className="w-4 h-4 mx-auto mb-1 text-black" />
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-sm font-bold text-black">
                        {formatCurrency(summary.total_amount)}
                      </p>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-600" />
                      <p className="text-xs text-gray-500">Aprobados</p>
                      <p className="text-sm font-bold text-green-600">
                        {summary.approved_count}
                      </p>
                    </div>
                    <div className="text-center">
                      <CreditCard className="w-4 h-4 mx-auto mb-1 text-yellow-600" />
                      <p className="text-xs text-gray-500">Pendientes</p>
                      <p className="text-sm font-bold text-yellow-600">
                        {summary.pending_count}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col gap-3">
                    <SearchBar
                      value={filters.search || ""}
                      onChange={updateSearch}
                      placeholder="Buscar en este mes..."
                    />
                    <PaymentFilters
                      statusFilter={filters.status || "all"}
                      onStatusChange={updateStatusFilter}
                      onReset={resetFilters}
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="p-4">
                  <PaymentTable
                    payments={payments}
                    isLoading={isLoading}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    onPageChange={goToPage}
                    onViewDetails={handleViewDetails}
                    onDelete={onDelete}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Detalles */}
      <PaymentDetailModal
        payment={selectedPayment}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onPaymentUpdated={handlePaymentUpdated}
      />
    </>
  );
};

const MonthlyHistory = ({ monthlyHistory, isLoading }: MonthlyHistoryProps) => {
  const { toast } = useToast();

  const handleDeletePayment = useCallback(async (payment: Payment) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer.\n\nPago: ${formatCurrency(payment.amount)}\nCliente: ${payment.customer_name}`
    );

    if (!confirmed) return;

    const deletePromise = paymentsService.delete(payment.id);

    toast.promise(deletePromise, {
      loading: "Eliminando pago...",
      success: "Pago eliminado exitosamente.",
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
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-gray-500">Cargando historial...</p>
      </div>
    );
  }

  if (monthlyHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
        <div className="text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-base sm:text-lg font-bold text-gray-700 mb-2">
            No hay historial de meses anteriores
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            Los pagos de meses pasados aparecerán aquí
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {monthlyHistory.map((summary) => (
        <MonthAccordion
          key={`${summary.year}-${summary.month}`}
          summary={summary}
          onDelete={handleDeletePayment}
        />
      ))}
    </div>
  );
};

export default MonthlyHistory;

