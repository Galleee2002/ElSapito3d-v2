import { cn } from "@/utils/cn";

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const SectionCard = ({ title, children, className, action }: SectionCardProps) => {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden", className)}>
      {(title || action) && (
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          {title && (
            <h3 className="text-base font-bold text-[var(--color-contrast-base)] font-baloo">
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-4 sm:p-5">
        {children}
      </div>
    </div>
  );
};

