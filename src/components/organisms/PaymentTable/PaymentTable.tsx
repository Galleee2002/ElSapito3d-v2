import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { TableCell, Spinner, Button } from "@/components";
import { PaymentRow } from "@/components";
import { cn } from "@/utils";
import type { Payment } from "@/types";

interface PaymentTableProps {
  payments: Payment[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onViewDetails: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
}

const PaymentTable = ({
  payments,
  isLoading,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onViewDetails,
  onDelete,
}: PaymentTableProps) => {
  const handlePrevPage = useCallback(() => {
    onPageChange(currentPage - 1);
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    onPageChange(currentPage + 1);
  }, [currentPage, onPageChange]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-gray-500">Cargando pagos...</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
        <div className="text-center">
          <p className="text-base sm:text-lg font-bold text-gray-700 mb-2">
            No se registraron pagos aún
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            Los pagos aparecerán aquí cuando se realicen transacciones
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tabla con scroll horizontal en móvil */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <TableCell isHeader>ID</TableCell>
                  <TableCell isHeader>Cliente</TableCell>
                  <TableCell isHeader>Monto</TableCell>
                  <TableCell isHeader className="hidden sm:table-cell">
                    Método
                  </TableCell>
                  <TableCell isHeader>Estado</TableCell>
                  <TableCell isHeader className="hidden md:table-cell">
                    Fecha
                  </TableCell>
                  <TableCell isHeader className="hidden lg:table-cell">
                    Orden
                  </TableCell>
                  <TableCell isHeader align="center">
                    Acción
                  </TableCell>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <PaymentRow
                    key={payment.id}
                    payment={payment}
                    onViewDetails={onViewDetails}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs sm:text-sm text-gray-600">
            Mostrando {payments.length} de {totalCount} pagos
          </p>
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "tween", duration: 0.15 }}
            >
              <Button
                variant="secondary"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={cn(
                  "text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </motion.div>
            <span className="text-xs sm:text-sm font-semibold text-[var(--color-contrast-base)] px-2">
              {currentPage} / {totalPages}
            </span>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "tween", duration: 0.15 }}
            >
              <Button
                variant="secondary"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={cn(
                  "text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTable;

