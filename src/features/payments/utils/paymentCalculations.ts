import { PaymentItemMetadata } from "../types/payment.domain";

interface ItemTotals {
  baseSubtotal: number;
  accessoriesTotal: number;
  totalWithAccessories: number;
  unitTotalWithAccessories: number;
  hasAccessories: boolean;
  hasAccessoriesPrice: boolean;
}

export const calculateItemTotals = (item: PaymentItemMetadata): ItemTotals => {
  const quantity = item.quantity ?? 0;
  const unitPrice = item.unit_price ?? 0;
  const baseSubtotal = quantity * unitPrice;

  const accessoriesTotal = (item.selectedAccessories || []).reduce((sum, accessory) => {
    const accessoryPrice = accessory.price ?? 0;
    return sum + accessoryPrice * accessory.quantity;
  }, 0);

  const totalWithAccessories = baseSubtotal + accessoriesTotal;
  const unitTotalWithAccessories = quantity > 0 ? totalWithAccessories / quantity : 0;

  return {
    baseSubtotal,
    accessoriesTotal,
    totalWithAccessories,
    unitTotalWithAccessories,
    hasAccessories: (item.selectedAccessories?.length ?? 0) > 0,
    hasAccessoriesPrice: accessoriesTotal > 0,
  };
};

