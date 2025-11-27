import { supabase } from "./supabase";
import {
  getStartOfCurrentMonth,
  getEndOfCurrentMonth,
  getStartOfMonth,
  getEndOfMonth,
  toISOString,
  extractYearMonth,
} from "@/utils";
import type {
  Payment,
  PaymentFilters,
  PaymentStatistics,
  CreatePaymentInput,
  PaymentStatus,
  CurrentMonthStatistics,
  MonthlyPaymentSummary,
} from "@/types";

class PaymentsService {
  private readonly tableName = "payments";

  async getAll(
    filters?: PaymentFilters,
    limit = 50,
    offset = 0
  ): Promise<{ data: Payment[]; count: number }> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*", { count: "exact" })
        .order("payment_date", { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.search) {
        query = query.or(
          `customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`
        );
      }

      if (filters?.status && filters.status !== "all") {
        query = query.eq("payment_status", filters.status);
      }

      if (filters?.dateFrom) {
        query = query.gte("payment_date", filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte("payment_date", filters.dateTo);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return { data: data || [], count: count || 0 };
    } catch (error) {
      return { data: [], count: 0 };
    }
  }

  async getById(id: string): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  async getStatistics(): Promise<PaymentStatistics | null> {
    try {
      const { data, error } = await supabase
        .from("payment_statistics")
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  async create(input: CreatePaymentInput): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          ...input,
          payment_status: input.payment_status || "pendiente",
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async updatePaymentStatus(
    id: string,
    status: PaymentStatus,
    notes?: string
  ): Promise<Payment | null> {
    try {
      // Si es aprobación, usar la función de Supabase para bypassear RLS
      if (status === "aprobado") {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Supabase configuration missing");
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token || supabaseAnonKey;

        const response = await fetch(
          `${supabaseUrl}/functions/v1/approve-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              payment_id: id,
              notes,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Error desconocido" }));
          const errorMessage = errorData.details
            ? `${errorData.error}: ${errorData.details}`
            : errorData.error ||
              `Error al aprobar el pago: ${response.statusText}`;
          throw new Error(errorMessage);
        }

        const result = await response.json();
        return result.payment || null;
      }

      // Para otros estados, usar el método directo (si las políticas RLS lo permiten)
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ payment_status: status, notes })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getCustomerPaymentHistory(email: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("customer_email", email)
        .order("payment_date", { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  async updatePaymentStatusByExternalReference(
    externalReference: string,
    status: PaymentStatus,
    mpPaymentId?: string
  ): Promise<Payment | null> {
    try {
      const updateData: Record<string, unknown> = {
        payment_status: status,
        updated_at: new Date().toISOString(),
      };

      if (mpPaymentId) {
        updateData.mp_payment_id = mpPaymentId;
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq("mp_external_reference", externalReference)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase configuration missing");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || supabaseAnonKey;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/delete-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            payment_id: id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Error desconocido" }));
        const errorMessage =
          errorData.error ||
          `Error al eliminar el pago: ${response.statusText}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      throw error;
    }
  }

  onPaymentsChanged(callback: () => void): () => void {
    const channel = supabase
      .channel("payments-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: this.tableName },
        () => {
          callback();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }

  // ============ MÉTODOS PARA GESTIÓN MENSUAL ============

  /**
   * Obtiene los pagos del mes actual
   */
  async getCurrentMonthPayments(
    filters?: Omit<PaymentFilters, "dateFrom" | "dateTo">,
    limit = 50,
    offset = 0
  ): Promise<{ data: Payment[]; count: number }> {
    try {
      const startOfMonth = toISOString(getStartOfCurrentMonth());
      const endOfMonth = toISOString(getEndOfCurrentMonth());

      let query = supabase
        .from(this.tableName)
        .select("*", { count: "exact" })
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.search) {
        query = query.or(
          `customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,id.ilike.%${filters.search}%`
        );
      }

      if (filters?.status && filters.status !== "all") {
        query = query.eq("payment_status", filters.status);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return { data: data || [], count: count || 0 };
    } catch (error) {
      return { data: [], count: 0 };
    }
  }

  /**
   * Obtiene las estadísticas del mes actual
   */
  async getCurrentMonthStatistics(): Promise<CurrentMonthStatistics> {
    try {
      const startOfMonth = toISOString(getStartOfCurrentMonth());
      const endOfMonth = toISOString(getEndOfCurrentMonth());

      const { data, error } = await supabase
        .from(this.tableName)
        .select("payment_status, amount")
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth);

      if (error) {
        throw error;
      }

      const payments = data || [];

      const approved = payments.filter((p) => p.payment_status === "aprobado");
      const pending = payments.filter((p) => p.payment_status === "pendiente");
      const rejected = payments.filter((p) => p.payment_status === "rechazado");

      return {
        total_amount: approved.reduce((sum, p) => sum + (p.amount || 0), 0),
        approved_count: approved.length,
        pending_count: pending.length,
        rejected_count: rejected.length,
        pending_amount: pending.reduce((sum, p) => sum + (p.amount || 0), 0),
      };
    } catch (error) {
      return {
        total_amount: 0,
        approved_count: 0,
        pending_count: 0,
        rejected_count: 0,
        pending_amount: 0,
      };
    }
  }

  /**
   * Obtiene los pagos de un mes específico
   */
  async getPaymentsByMonth(
    year: number,
    month: number,
    filters?: Omit<PaymentFilters, "dateFrom" | "dateTo">,
    limit = 50,
    offset = 0
  ): Promise<{ data: Payment[]; count: number }> {
    try {
      const startOfMonth = toISOString(getStartOfMonth(year, month));
      const endOfMonth = toISOString(getEndOfMonth(year, month));

      let query = supabase
        .from(this.tableName)
        .select("*", { count: "exact" })
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.search) {
        query = query.or(
          `customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,id.ilike.%${filters.search}%`
        );
      }

      if (filters?.status && filters.status !== "all") {
        query = query.eq("payment_status", filters.status);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return { data: data || [], count: count || 0 };
    } catch (error) {
      return { data: [], count: 0 };
    }
  }

  /**
   * Obtiene el resumen de un mes específico
   */
  async getMonthSummary(
    year: number,
    month: number
  ): Promise<MonthlyPaymentSummary> {
    try {
      const startOfMonth = toISOString(getStartOfMonth(year, month));
      const endOfMonth = toISOString(getEndOfMonth(year, month));

      const { data, error } = await supabase
        .from(this.tableName)
        .select("payment_status, amount")
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth);

      if (error) {
        throw error;
      }

      const payments = data || [];

      const approved = payments.filter((p) => p.payment_status === "aprobado");
      const pending = payments.filter((p) => p.payment_status === "pendiente");
      const rejected = payments.filter((p) => p.payment_status === "rechazado");

      return {
        year,
        month,
        total_amount: approved.reduce((sum, p) => sum + (p.amount || 0), 0),
        approved_count: approved.length,
        pending_count: pending.length,
        rejected_count: rejected.length,
        total_payments: payments.length,
      };
    } catch (error) {
      return {
        year,
        month,
        total_amount: 0,
        approved_count: 0,
        pending_count: 0,
        rejected_count: 0,
        total_payments: 0,
      };
    }
  }

  /**
   * Obtiene todos los meses con pagos (historial)
   */
  async getMonthlyHistory(): Promise<MonthlyPaymentSummary[]> {
    try {
      // Obtener el pago más antiguo para determinar el rango
      const { data: oldestPayment, error: oldestError } = await supabase
        .from(this.tableName)
        .select("created_at")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (oldestError || !oldestPayment) {
        return [];
      }

      // Obtener todos los pagos agrupados
      const { data, error } = await supabase
        .from(this.tableName)
        .select("created_at, payment_status, amount")
        .order("created_at", { ascending: false });

      if (error || !data) {
        return [];
      }

      // Agrupar pagos por mes
      const monthsMap = new Map<string, MonthlyPaymentSummary>();

      data.forEach((payment) => {
        const { year, month } = extractYearMonth(payment.created_at);
        const now = new Date();

        // Excluir el mes actual
        if (year === now.getFullYear() && month === now.getMonth()) {
          return;
        }

        const key = `${year}-${month}`;

        if (!monthsMap.has(key)) {
          monthsMap.set(key, {
            year,
            month,
            total_amount: 0,
            approved_count: 0,
            pending_count: 0,
            rejected_count: 0,
            total_payments: 0,
          });
        }

        const summary = monthsMap.get(key)!;
        summary.total_payments++;

        if (payment.payment_status === "aprobado") {
          summary.approved_count++;
          summary.total_amount += payment.amount || 0;
        } else if (payment.payment_status === "pendiente") {
          summary.pending_count++;
        } else if (payment.payment_status === "rechazado") {
          summary.rejected_count++;
        }
      });

      // Convertir a array y ordenar por fecha (más recientes primero)
      return Array.from(monthsMap.values()).sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year;
        }
        return b.month - a.month;
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Limpia pagos pendientes expirados (más de 30 minutos)
   * Marca como "cancelado" todos los pagos que quedaron pendientes
   */
  async cleanupExpiredPayments(): Promise<{
    success: boolean;
    cancelled_count: number;
    message: string;
  }> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase configuration missing");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || supabaseAnonKey;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/cleanup-expired-payments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Error desconocido" }));
        throw new Error(
          errorData.error ||
            `Error al limpiar pagos expirados: ${response.statusText}`
        );
      }

      const result = await response.json();
      return {
        success: true,
        cancelled_count: result.cancelled_count || 0,
        message: result.message || "Limpieza completada",
      };
    } catch (error) {
      throw error;
    }
  }
}

export const paymentsService = new PaymentsService();
