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
  secondaryText = "Ver galería 3D →",
  className,
}: CtaGroupProps) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6",
        className
      )}
    >
      <Button variant="hero" interactive={false} onClick={onPrimaryClick}>
        {primaryText}
      </Button>
      <Button variant="hero" interactive={false} onClick={onSecondaryClick}>
        {secondaryText}
      </Button>
    </div>
  );
};

export default CtaGroup;
