import { useState, useCallback, useEffect, useRef } from "react";
import { paymentsService } from "@/services";
import type { Payment, PaymentFilters, CurrentMonthStatistics, PaymentStatus } from "@/types";

const ITEMS_PER_PAGE = 10;

export const useCurrentMonthPayments = (isEnabled = true) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statistics, setStatistics] = useState<CurrentMonthStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<Omit<PaymentFilters, "dateFrom" | "dateTo">>({
    search: "",
    status: "all",
  });
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const loadPayments = useCallback(async () => {
    if (!isEnabled) return;
    try {
      setIsLoading(true);
      setError(null);
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const { data, count } = await paymentsService.getCurrentMonthPayments(
        filters,
        ITEMS_PER_PAGE,
        offset
      );
      setPayments(data);
      setTotalCount(count);
    } catch (err) {
      setError("Error al cargar los pagos del mes actual");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters, isEnabled]);

  const loadStatistics = useCallback(async () => {
    if (!isEnabled) return;
    try {
      const stats = await paymentsService.getCurrentMonthStatistics();
      setStatistics(stats);
    } catch (err) {
      // Error silenciado - estadísticas no críticas
    }
  }, [isEnabled]);

  useEffect(() => {
    if (isEnabled) {
      void loadPayments();
      void loadStatistics();
    }
  }, [isEnabled, loadPayments, loadStatistics]);

  useEffect(() => {
    if (!isEnabled) return;
    
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    
    unsubscribeRef.current = paymentsService.onPaymentsChanged(() => {
      void loadPayments();
      void loadStatistics();
    });
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isEnabled, loadPayments, loadStatistics]);

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

