import { cn } from "@/utils/cn";
import { ReactNode } from "react";

interface InfoRowProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  className?: string;
  valueClassName?: string;
  layout?: "horizontal" | "vertical";
}

export const InfoRow = ({ 
  label, 
  value, 
  icon, 
  className, 
  valueClassName,
  layout = "vertical" 
}: InfoRowProps) => {
  return (
    <div className={cn("flex gap-3", className)}>
      {icon && (
        <div className="text-[var(--color-border-base)] mt-0.5 flex-shrink-0">
          {icon}
        </div>
      )}
      <div className={cn("flex-1 min-w-0", layout === "horizontal" ? "flex justify-between items-center gap-4" : "")}>
        <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
        <div className={cn("text-sm font-semibold text-gray-900 break-words", valueClassName)}>
          {value || <span className="text-gray-400 italic">No disponible</span>}
        </div>
      </div>
    </div>
  );
};

