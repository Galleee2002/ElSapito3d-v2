import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { Modal } from "@/components"; // Usando el export barrel original
import { cn } from "@/utils/cn";
import { motionVariants } from "@/constants/motion";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/utils/formatters";

// Domain & Features
import { Payment } from "@/features/payments/types/payment.domain";
import { PaymentHeader } from "@/features/payments/components/PaymentHeader";
import { CustomerInfoSection } from "@/features/payments/components/CustomerInfoSection";
import { PaymentItemsList } from "@/features/payments/components/PaymentItemsList";
import { PaymentInfoSection } from "@/features/payments/components/PaymentInfoSection";
import { TransferProofViewer } from "@/features/payments/components/TransferProofViewer";
import { PaymentHistoryTimeline } from "@/features/payments/components/PaymentHistoryTimeline";
import { SectionCard } from "@/components/ui/SectionCard";

// Hooks
import { useCustomerPaymentHistory } from "@/features/payments/hooks/usePayments";
import { usePaymentMutations } from "@/features/payments/hooks/usePaymentMutations";

// Legacy Type Support (to allow passing old type from parent)
import { Payment as LegacyPayment } from "@/types";

interface PaymentDetailModalProps {
  payment: LegacyPayment | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentUpdated?: () => void;
}

const PaymentDetailModal = ({
  payment,
  isOpen,
  onClose,
  onPaymentUpdated,
}: PaymentDetailModalProps) => {
  const { user } = useAuth();
  
  // Mantenemos estado local del pago para reflejar actualizaciones optimistas si fuera necesario,
  // y para castear al nuevo tipo de dominio.
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);

  useEffect(() => {
    if (payment) {
        // En un escenario real, aquí haríamos PaymentSchema.parse(payment)
        // Por ahora confiamos en la compatibilidad de estructura
        setCurrentPayment(payment as unknown as Payment);
    } else {
        setCurrentPayment(null);
    }
  }, [payment]);

  // Data Fetching
  const { data: history = [], isLoading: isLoadingHistory } = useCustomerPaymentHistory(
    currentPayment?.customer_email,
    currentPayment?.id
  );

  // Mutations
  const { approvePayment, deletePayment } = usePaymentMutations(
    () => { // On Success General
        onPaymentUpdated?.();
    },
    () => { // On Delete Close
        onClose();
    }
  );

  const handleApprove = async () => {
    if (!currentPayment) return;
    
    // TODO: Reemplazar por ConfirmDialog custom en el futuro
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas aprobar el pago de ${formatCurrency(currentPayment.amount)}?`
    );

    if (confirmed) {
      approvePayment.mutate(
        { id: currentPayment.id, notes: currentPayment.notes || undefined },
        {
            onSuccess: (updatedData) => {
                // Actualizamos el estado local inmediatamente si la mutación devuelve datos
                if (updatedData) {
                    setCurrentPayment(updatedData as unknown as Payment);
                }
            }
        }
      );
    }
  };

  const handleDelete = async () => {
    if (!currentPayment) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer.`
    );

    if (confirmed) {
      deletePayment.mutate(currentPayment.id);
    }
  };

  if (!currentPayment || !isOpen) return null;

  const isAdmin = user?.isAdmin ?? false;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={motionVariants.spring}
        className={cn("flex flex-col", "flex-1 min-h-0", "overflow-hidden", "bg-gray-50/50")}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 border-[var(--color-border-base)] bg-[var(--color-frog-green)] flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-black font-baloo">
            Detalles del Pago
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[var(--color-toad-eyes)] bg-white text-[var(--color-toad-eyes)] transition-all cursor-pointer hover:bg-[var(--color-toad-eyes)] hover:text-white focus:outline-none"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 min-h-0 space-y-6">
          
          {/* 1. Header & Actions */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <PaymentHeader 
                payment={currentPayment}
                onApprove={handleApprove}
                onDelete={handleDelete}
                isApproving={approvePayment.isPending}
                isDeleting={deletePayment.isPending}
                isAdmin={isAdmin}
            />
          </div>

          {/* 2. Customer Info */}
          <CustomerInfoSection payment={currentPayment} />

          {/* 3. Products List */}
          {currentPayment.metadata?.items && currentPayment.metadata.items.length > 0 && (
             <PaymentItemsList items={currentPayment.metadata.items} />
          )}

          {/* 4. Payment Technical Info */}
          <PaymentInfoSection payment={currentPayment} />

          {/* 5. Transfer Proof */}
          <TransferProofViewer url={currentPayment.transfer_proof_url} />

          {/* 6. Notes */}
          {currentPayment.notes && (
            <SectionCard title="Notas" className="mb-4">
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                {currentPayment.notes}
              </p>
            </SectionCard>
          )}

          {/* 7. History */}
          <PaymentHistoryTimeline 
            history={history} 
            isLoading={isLoadingHistory} 
          />

        </div>
      </motion.div>
    </Modal>
  );
};

export default PaymentDetailModal;
