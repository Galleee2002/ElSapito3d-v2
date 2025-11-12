import { type ReactNode } from "react";
import { cn } from "@/utils";

interface TableCellProps {
  children: ReactNode;
  className?: string;
  isHeader?: boolean;
  align?: "left" | "center" | "right";
}

const TableCell = ({
  children,
  className,
  isHeader = false,
  align = "left",
}: TableCellProps) => {
  const Tag = isHeader ? "th" : "td";

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <Tag
      className={cn(
        "px-3 py-3 sm:px-4",
        alignmentClasses[align],
        isHeader
          ? "font-bold text-xs sm:text-sm text-[var(--color-contrast-base)] bg-gray-50 border-b-2 border-[var(--color-border-blue)]"
          : "text-xs sm:text-sm text-gray-700",
        className
      )}
      style={isHeader ? { fontFamily: "var(--font-baloo)" } : undefined}
    >
      {children}
    </Tag>
  );
};

export default TableCell;

