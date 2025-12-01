import { z } from "zod";

// --- Sub-schemas ---

export const PaymentMethodSchema = z.enum([
  "mercado_pago",
  "tarjeta_credito",
  "tarjeta_debito",
  "transferencia",
  "otro",
]);

export const PaymentStatusSchema = z.enum([
  "aprobado",
  "pendiente",
  "rechazado",
  "cancelado",
  "reembolsado",
]);

export const PaymentItemColorSchema = z.object({
  name: z.string(),
  code: z.string(),
});

export const PaymentItemSectionColorSchema = z.object({
  sectionId: z.string(),
  sectionLabel: z.string(),
  colorId: z.string(),
  colorName: z.string(),
  colorCode: z.string(),
});

export const PaymentItemAccessorySchema = z.object({
  name: z.string(),
  color: PaymentItemColorSchema.optional(),
  quantity: z.number().min(1),
  price: z.number().min(0).optional(),
});

export const PaymentItemColorQuantitySchema = z.object({
  color: PaymentItemColorSchema,
  quantity: z.number().min(1),
});

export const PaymentItemMetadataSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional().default("Producto sin nombre"),
  quantity: z.number().default(1),
  unit_price: z.number().default(0),
  selectedColors: z.array(PaymentItemColorSchema).optional().default([]),
  colorQuantities: z.array(PaymentItemColorQuantitySchema).optional().default([]),
  selectedSections: z.array(PaymentItemSectionColorSchema).optional().default([]),
  selectedAccessories: z.array(PaymentItemAccessorySchema).optional().default([]),
});

// --- Main Metadata Schema ---

export const PaymentMetadataSchema = z.object({
  items: z.array(PaymentItemMetadataSchema).optional().default([]),
  currency: z.string().optional(),
  delivery_method: z.union([
    z.literal("pickup"), 
    z.literal("shipping"), 
    z.string()
  ]).nullable().optional(),
}).catchall(z.unknown()); // Permite otras propiedades extra sin romper

// --- Full Payment Schema (Database Row) ---

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  customer_name: z.string(),
  customer_email: z.string().email(),
  customer_phone: z.string().nullable(),
  customer_instagram: z.string().nullable(),
  customer_address: z.string().nullable(),
  amount: z.number(),
  payment_method: PaymentMethodSchema,
  payment_status: PaymentStatusSchema,
  product_id: z.string().nullable(),
  order_id: z.string().nullable(),
  mp_payment_id: z.string().nullable(),
  mp_preference_id: z.string().nullable(),
  mp_merchant_order_id: z.string().nullable(),
  mp_collection_id: z.string().nullable(),
  mp_collection_status: z.string().nullable(),
  mp_external_reference: z.string().nullable(),
  mp_payment_type: z.string().nullable(),
  payment_date: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  notes: z.string().nullable(),
  metadata: PaymentMetadataSchema.nullable().transform((val) => val || { items: [] }), // Null safety
  transfer_proof_url: z.string().nullable(),
});

// --- Statistics Schemas ---

export const MonthlyPaymentSummarySchema = z.object({
  year: z.number(),
  month: z.number(),
  total_amount: z.number(),
  approved_count: z.number(),
  pending_count: z.number(),
  rejected_count: z.number(),
  total_payments: z.number(),
});

// --- Infer Types ---

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type PaymentItemMetadata = z.infer<typeof PaymentItemMetadataSchema>;
export type PaymentMetadata = z.infer<typeof PaymentMetadataSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type MonthlyPaymentSummary = z.infer<typeof MonthlyPaymentSummarySchema>;

