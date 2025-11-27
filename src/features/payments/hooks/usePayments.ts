import { useQuery } from "@tanstack/react-query";
import { paymentsService } from "@/services/payments.service";
import { Payment } from "../types/payment.domain";

export const useCustomerPaymentHistory = (email: string | undefined, currentPaymentId: string | undefined) => {
  return useQuery({
    queryKey: ["payment-history", email],
    queryFn: async () => {
      if (!email) return [];
      const history = await paymentsService.getCustomerPaymentHistory(email);
      // Filter out current payment if provided, and map to our Domain type 
      // (Ideally we would validate with Zod schema here too)
      return history.filter(p => p.id !== currentPaymentId) as unknown as Payment[];
    },
    enabled: !!email && !!currentPaymentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

