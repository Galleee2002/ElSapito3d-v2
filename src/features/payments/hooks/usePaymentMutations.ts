import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentsService } from "@/services/payments.service";
import { useToast } from "@/hooks/useToast";

export const usePaymentMutations = (onSuccessCallback?: () => void, onCloseCallback?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const approvePayment = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      return paymentsService.updatePaymentStatus(id, "aprobado", notes);
    },
    onSuccess: (updatedPayment) => {
      // Invalidate both lists and individual payment queries
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment-history"] });
      
      // Optimistically update or set data if returned
      if (updatedPayment) {
          queryClient.setQueryData(["payment", updatedPayment.id], updatedPayment);
      }
      
      toast.success("Pago aprobado exitosamente. El cliente recibirá una notificación en tiempo real.");
      onSuccessCallback?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Error al aprobar pago");
    },
  });

  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      return paymentsService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Pago eliminado exitosamente.");
      onSuccessCallback?.();
      onCloseCallback?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Error al eliminar pago");
    },
  });

  return {
    approvePayment,
    deletePayment,
  };
};

