export type PaymentMethod =
  | "mercado_pago"
  | "tarjeta_credito"
  | "tarjeta_debito"
  | "transferencia"
  | "efectivo"
  | "otro";

export type PaymentStatus =
  | "aprobado"
  | "pendiente"
  | "rechazado"
  | "cancelado"
  | "reembolsado";

export interface Payment {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_address: string | null;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  product_id: string | null;
  order_id: string | null;
  mp_payment_id: string | null;
  mp_preference_id: string | null;
  mp_merchant_order_id: string | null;
  mp_collection_id: string | null;
  mp_collection_status: string | null;
  mp_external_reference: string | null;
  mp_payment_type: string | null;
  payment_date: string;
  created_at: string;
  updated_at: string;
  notes: string | null;
  metadata: Record<string, unknown>;
  transfer_proof_url: string | null;
}

export interface PaymentFilters {
  search?: string;
  status?: PaymentStatus | "all";
  dateFrom?: string;
  dateTo?: string;
}

export interface PaymentStatistics {
  total_payments: number;
  approved_count: number;
  pending_count: number;
  rejected_count: number;
  total_approved_amount: number;
  total_pending_amount: number;
  average_approved_amount: number;
  current_month_approved_count: number;
  current_month_approved_amount: number;
}

export interface CreatePaymentInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status?: PaymentStatus;
  product_id?: string;
  order_id?: string;
  mp_payment_id?: string;
  mp_preference_id?: string;
  notes?: string;
  transfer_proof_url?: string;
  metadata?: Record<string, unknown>;
}

