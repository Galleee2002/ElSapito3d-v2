import { cn } from "@/utils";

/**
 * @deprecated Use Badge from "@/components/ui/Badge" instead.
 * This component will be removed in future versions.
 */
interface BadgeProps {
  label: "Nuevo" | "Top";
  className?: string;
}

const Badge = ({ label, className }: BadgeProps) => {
  return (
    <span
      className={cn(
        "absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-[var(--color-bouncy-lemon)] border-2 border-[var(--color-border-base)] text-[var(--color-border-base)] z-10",
        className
      )}
    >
      {label}
    </span>
  );
};

export default Badge;
