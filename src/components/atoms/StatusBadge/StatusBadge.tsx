import { cn } from "@/utils";

interface StatusBadgeProps {
  label: string;
  className?: string;
}

const StatusBadge = ({ label, className }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full border text-xs font-semibold",
        className
      )}
    >
      {label}
    </span>
  );
};

export default StatusBadge;

