import { cn } from "@/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card = ({ children, className, hover = true }: CardProps) => {
  return (
    <div
      className={cn(
        "bg-[var(--color-surface)] rounded-[var(--radius-md)] shadow-[var(--shadow-md)] p-6",
        hover && "transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
