import { cn } from "@/utils";

interface AlertProps {
  message: string;
  type: "success" | "error" | "info";
  className?: string;
}

const Alert = ({ message, type, className }: AlertProps) => {
  if (!message) return null;

  const typeStyles = {
    success: "bg-green-50 text-green-700 border-green-200",
    error: "bg-red-50 text-red-700 border-red-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div
      className={cn(
        "mb-4 p-3 rounded-lg text-sm border",
        typeStyles[type],
        className
      )}
      role="alert"
    >
      {message}
    </div>
  );
};

export default Alert;

