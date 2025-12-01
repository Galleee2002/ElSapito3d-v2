export type PaymentMethod =
  | "mercado_pago"
  | "tarjeta_credito"
  | "tarjeta_debito"
  | "transferencia"
  | "otro";

export type PaymentStatus =
  | "aprobado"
  | "pendiente"
  | "rechazado"
  | "cancelado"
  | "reembolsado";

export interface PaymentItemColor {
  name: string;
  code: string;
}

export interface PaymentItemSectionColor {
  sectionId: string;
  sectionLabel: string;
  colorId: string;
  colorName: string;
  colorCode: string;
}

export interface PaymentItemAccessory {
  name: string;
  color: PaymentItemColor;
  quantity: number;
  price?: number;
}

export interface PaymentItemColorQuantity {
  color: PaymentItemColor;
  quantity: number;
}

export interface PaymentItemMetadata {
  id?: string;
  title?: string;
  quantity?: number;
  unit_price?: number;
  selectedColors?: PaymentItemColor[];
  colorQuantities?: PaymentItemColorQuantity[];
  selectedSections?: PaymentItemSectionColor[];
  selectedAccessories?: PaymentItemAccessory[];
}

export interface PaymentMetadata {
  items?: PaymentItemMetadata[];
  currency?: string;
  delivery_method?: "pickup" | "shipping" | string | null;
  [key: string]: unknown;
}

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
  metadata: PaymentMetadata | null;
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
  metadata?: PaymentMetadata;
}

export interface MonthlyPaymentSummary {
  year: number;
  month: number;
  total_amount: number;
  approved_count: number;
  pending_count: number;
  rejected_count: number;
  total_payments: number;
}

export interface CurrentMonthStatistics {
  total_amount: number;
  approved_count: number;
  pending_count: number;
  rejected_count: number;
  pending_amount: number;
}

