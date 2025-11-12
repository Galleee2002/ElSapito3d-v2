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
      return null;
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

