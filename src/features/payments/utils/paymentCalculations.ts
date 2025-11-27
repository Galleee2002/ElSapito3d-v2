import { PaymentItemMetadata } from "../types/payment.domain";

interface ItemTotals {
  baseSubtotal: number;
  accessoriesTotal: number;
  totalWithAccessories: number;
  unitTotalWithAccessories: number;
  hasAccessoriesPrice: boolean;
}

export const calculateItemTotals = (item: PaymentItemMetadata): ItemTotals => {
  const quantity = item.quantity ?? 0;
  const unitPrice = item.unit_price ?? 0;
  const baseSubtotal = quantity * unitPrice;

  const accessoriesTotal = (item.selectedAccessories || []).reduce(
    (sum, accessory) => {
      const accessoryPrice = accessory.price ?? 0;
      return sum + accessoryPrice * accessory.quantity;
    },
    0
  );

  // unit_price ya incluye accesorios en los flujos actuales,
  // por lo que el subtotal base representa el total real del ítem.
  const totalWithAccessories = baseSubtotal;
  const unitTotalWithAccessories = quantity > 0 ? unitPrice : 0;

  return {
    baseSubtotal,
    accessoriesTotal,
    totalWithAccessories,
    unitTotalWithAccessories,
    hasAccessoriesPrice: accessoriesTotal > 0,
  };
};

