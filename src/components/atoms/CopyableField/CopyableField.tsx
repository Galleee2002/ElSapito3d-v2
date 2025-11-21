import { Copy, Check } from "lucide-react";

interface CopyableFieldProps {
  label: string;
  value: string;
  fieldName: string;
  onCopy: (text: string, fieldName: string) => void;
  copiedField: string | null;
  isSubmitting?: boolean;
  isMonospace?: boolean;
}

const CopyableField = ({
  label,
  value,
  fieldName,
  onCopy,
  copiedField,
  isSubmitting = false,
  isMonospace = false,
}: CopyableFieldProps) => {
  const isCopied = copiedField === fieldName;

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
      <div>
        <p
          className="text-xs text-gray-500 mb-1"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          {label}
        </p>
        <p
          className={`font-medium text-[var(--color-border-base)] ${
            isMonospace ? "font-mono text-sm" : ""
          }`}
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onCopy(value, fieldName)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        disabled={isSubmitting}
      >
        {isCopied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400" />
        )}
      </button>
    </div>
  );
};

export default CopyableField;

