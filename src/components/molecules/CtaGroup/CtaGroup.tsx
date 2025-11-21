import { Button } from "@/components";
import { cn } from "@/utils";

interface CtaGroupProps {
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  primaryText?: string;
  secondaryText?: string;
  className?: string;
}

const CtaGroup = ({
  onPrimaryClick,
  onSecondaryClick,
  primaryText = "Contactanos",
  secondaryText = "Productos",
  className,
}: CtaGroupProps) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6",
        className
      )}
    >
      <Button variant="hero" onClick={onPrimaryClick}>
        {primaryText}
      </Button>
      <Button variant="hero" onClick={onSecondaryClick}>
        {secondaryText}
      </Button>
    </div>
  );
};

export default CtaGroup;
