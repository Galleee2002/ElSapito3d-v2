export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mercado_pago: "Mercado Pago",
  tarjeta_credito: "Tarjeta de Crédito",
  tarjeta_debito: "Tarjeta de Débito",
  transferencia: "Transferencia",
  efectivo: "Efectivo",
  otro: "Otro",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  aprobado: "Aprobado",
  pendiente: "Pendiente",
  rechazado: "Rechazado",
  cancelado: "Cancelado",
  reembolsado: "Reembolsado",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  aprobado: "bg-green-100 text-green-700 border-green-300",
  pendiente: "bg-yellow-100 text-yellow-700 border-yellow-300",
  rechazado: "bg-red-100 text-red-700 border-red-300",
  cancelado: "bg-gray-100 text-gray-700 border-gray-300",
  reembolsado: "bg-blue-100 text-blue-700 border-blue-300",
};

export const BANK_TRANSFER_INFO = {
  name: "Liam jara zucchi",
  cbu: "0000003100035708163881",
  alias: "elsapito3d.mp",
  bank: "Mercado Pago",
  accountType: "Cuenta Virtual",
};

export const PAYMENT_DISCOUNT_TRANSFER_CASH = 0.05;
export const PAYMENT_SURCHARGE_MERCADO_PAGO = 0.1;

