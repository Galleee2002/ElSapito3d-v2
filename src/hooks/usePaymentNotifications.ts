import { useEffect, useRef } from "react";
import { supabase } from "@/services";
import { useAuth, useToast } from "@/hooks";
import { formatCurrency } from "@/utils";
import type { Payment } from "@/types";

export const usePaymentNotifications = () => {
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const processedPaymentsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    if (user.isAdmin) {
      return;
    }

    const userEmail = user.email.trim().toLowerCase();

    const channel = supabase
      .channel(`payment-notifications-${userEmail.replace(/[^a-z0-9]/g, "-")}`)
      .on<Payment>(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "payments",
          filter: `customer_email=eq.${userEmail}`,
        },
        (payload) => {
          const payment = payload.new as Payment;
          const oldPayment = payload.old as Payment;

          if (
            payment.payment_status === "aprobado" &&
            oldPayment.payment_status !== "aprobado" &&
            payment.customer_email?.toLowerCase() === userEmail &&
            !processedPaymentsRef.current.has(payment.id)
          ) {
            processedPaymentsRef.current.add(payment.id);

            showSuccess(
              `¡Tu pago de ${formatCurrency(payment.amount)} ha sido aprobado!`
            );
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      processedPaymentsRef.current.clear();
    };
  }, [user?.email, user?.isAdmin, showSuccess]);
};

