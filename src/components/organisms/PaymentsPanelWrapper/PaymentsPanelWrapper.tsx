import { memo } from "react";
import { PaymentsPanel, PaymentsPanelToggle } from "@/components";
import { useAuth, usePaymentsPanel } from "@/hooks";

const PaymentsPanelWrapper = memo(() => {
  const { user } = useAuth();
  const { isOpen, togglePanel, closePanel } = usePaymentsPanel();

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <>
      <PaymentsPanelToggle onClick={togglePanel} isOpen={isOpen} />
      <PaymentsPanel isOpen={isOpen} onClose={closePanel} />
    </>
  );
});

PaymentsPanelWrapper.displayName = "PaymentsPanelWrapper";

export default PaymentsPanelWrapper;

