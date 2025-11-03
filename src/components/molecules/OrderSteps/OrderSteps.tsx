import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components";
import { cn } from "@/utils";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface OrderStepsProps {
  steps: Step[];
  onRequestQuote?: () => void;
  className?: string;
}

const OrderSteps = ({ steps, onRequestQuote, className }: OrderStepsProps) => {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-text)] mb-4 sm:mb-6">
        Cómo hacer un pedido
      </h3>
      <div className="flex flex-col gap-4 mb-6 sm:mb-8 flex-1">
        {steps.map((step) => (
          <div key={step.number} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <CheckCircle2
                size={18}
                className="text-[var(--color-primary)]"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1">
              <h4 className="text-base sm:text-lg font-semibold text-[var(--color-text)] mb-1">
                {step.number}. {step.title}
              </h4>
              <p className="text-sm sm:text-base text-[var(--color-text)] opacity-70">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      {onRequestQuote && (
        <Button variant="primary" size="md" onClick={onRequestQuote} className="self-start mt-auto">
          Solicitar cotización
        </Button>
      )}
    </div>
  );
};

export default OrderSteps;

