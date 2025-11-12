import { useState, useCallback, useEffect } from "react";
import { paymentsService } from "@/services";
import type { Payment, PaymentFilters, PaymentStatistics, PaymentStatus } from "@/types";

const ITEMS_PER_PAGE = 10;

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<PaymentFilters>({
    search: "",
    status: "all",
  });

  const loadPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const { data, count } = await paymentsService.getAll(
        filters,
        ITEMS_PER_PAGE,
        offset
      );
      setPayments(data);
      setTotalCount(count);
    } catch (err) {
      setError("Error al cargar los pagos");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  const loadStatistics = useCallback(async () => {
    try {
      const stats = await paymentsService.getStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    }
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    void loadStatistics();
    const unsubscribe = paymentsService.onPaymentsChanged(() => {
      void loadPayments();
      void loadStatistics();
    });
    return unsubscribe;
  }, [loadPayments, loadStatistics]);

  const updateSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setCurrentPage(1);
  }, []);

  const updateStatusFilter = useCallback((status: PaymentStatus | "all") => {
    setFilters((prev) => ({ ...prev, status }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ search: "", status: "all" });
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return {
    payments,
    statistics,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalCount,
    filters,
    updateSearch,
    updateStatusFilter,
    resetFilters,
    goToPage,
    refresh: loadPayments,
  };
};

