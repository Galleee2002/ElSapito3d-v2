import { supabase } from "./supabase";
import type {
  Payment,
  PaymentFilters,
  PaymentStatistics,
  CreatePaymentInput,
  PaymentStatus,
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

        const { data: { session } } = await supabase.auth.getSession();
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
          const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
          const errorMessage = errorData.details 
            ? `${errorData.error}: ${errorData.details}` 
            : errorData.error || `Error al aprobar el pago: ${response.statusText}`;
          console.error("Error response from approve-payment:", errorData);
          throw new Error(errorMessage);
        }

        const result = await response.json();
        
        // Log del estado del email para debugging
        if (result.emailNotification) {
          if (result.emailNotification.sent) {
            console.log("[PAYMENTS-SERVICE] ✅ Email enviado exitosamente:", {
              emailId: result.emailNotification.emailId,
              customerEmail: result.payment?.customer_email,
            });
          } else if (result.emailNotification.error) {
            console.error("[PAYMENTS-SERVICE] ❌ Error al enviar email:", result.emailNotification.error);
          } else {
            console.warn("[PAYMENTS-SERVICE] ⚠️ Estado del email desconocido:", result.emailNotification);
          }
        } else {
          console.warn("[PAYMENTS-SERVICE] ⚠️ No se recibió información sobre el estado del email en la respuesta");
        }
        
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
      console.error("Error updating payment status:", error);
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
}

export const paymentsService = new PaymentsService();

