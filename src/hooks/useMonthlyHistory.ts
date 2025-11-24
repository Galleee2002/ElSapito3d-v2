import { useState, useCallback, useEffect, useRef } from "react";
import { paymentsService } from "@/services";
import type { MonthlyPaymentSummary, Payment, PaymentFilters, PaymentStatus } from "@/types";

const ITEMS_PER_PAGE = 10;

export const useMonthlyHistory = (isEnabled = true) => {
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyPaymentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const loadMonthlyHistory = useCallback(async () => {
    if (!isEnabled) return;
    try {
      setIsLoading(true);
      setError(null);
      const history = await paymentsService.getMonthlyHistory();
      setMonthlyHistory(history);
    } catch (err) {
      setError("Error al cargar el historial mensual");
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled]);

  useEffect(() => {
    if (isEnabled) {
      void loadMonthlyHistory();
    }
  }, [isEnabled, loadMonthlyHistory]);

  useEffect(() => {
    if (!isEnabled) return;
    
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    
    unsubscribeRef.current = paymentsService.onPaymentsChanged(() => {
      void loadMonthlyHistory();
    });
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isEnabled, loadMonthlyHistory]);

  return {
    monthlyHistory,
    isLoading,
    error,
    refresh: loadMonthlyHistory,
  };
};

interface UseMonthPaymentsParams {
  year: number;
  month: number;
  isEnabled?: boolean;
}

export const useMonthPayments = ({ year, month, isEnabled = true }: UseMonthPaymentsParams) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<Omit<PaymentFilters, "dateFrom" | "dateTo">>({
    search: "",
    status: "all",
  });

  const loadPayments = useCallback(async () => {
    if (!isEnabled) return;
    try {
      setIsLoading(true);
      setError(null);
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const { data, count } = await paymentsService.getPaymentsByMonth(
        year,
        month,
        filters,
        ITEMS_PER_PAGE,
        offset
      );
      setPayments(data);
      setTotalCount(count);
    } catch (err) {
      setError("Error al cargar los pagos del mes");
    } finally {
      setIsLoading(false);
    }
  }, [year, month, currentPage, filters, isEnabled]);

  useEffect(() => {
    if (isEnabled) {
      void loadPayments();
    }
  }, [isEnabled, loadPayments]);

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

