import { useState, ChangeEvent } from "react";
import { Upload, Copy, Check, FileText, Image as ImageIcon, X } from "lucide-react";
import { BANK_TRANSFER_INFO } from "@/constants";
import { useToast } from "@/hooks/useToast";

interface BankTransferFormProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  isSubmitting?: boolean;
}

const BankTransferForm = ({
  onFileSelect,
  selectedFile,
  isSubmitting = false,
}: BankTransferFormProps) => {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copiado al portapapeles`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("El archivo es demasiado grande. Máximo 10MB");
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Tipo de archivo no permitido. Solo imágenes o PDF");
        return;
      }

      onFileSelect(file);
    }
  };

  const removeFile = () => {
    onFileSelect(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--color-border-base)]/5 rounded-xl p-6 border border-[var(--color-border-base)]/20">
        <h4
          className="font-semibold text-[var(--color-border-base)] mb-4 flex items-center gap-2"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Datos para transferencia
        </h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div>
              <p
                className="text-xs text-gray-500 mb-1"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Titular
              </p>
              <p
                className="font-medium text-[var(--color-border-base)]"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                {BANK_TRANSFER_INFO.name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(BANK_TRANSFER_INFO.name, "Titular")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              {copiedField === "Titular" ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div>
              <p
                className="text-xs text-gray-500 mb-1"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                CBU
              </p>
              <p
                className="font-mono text-sm font-medium text-[var(--color-border-base)]"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                {BANK_TRANSFER_INFO.cbu}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(BANK_TRANSFER_INFO.cbu, "CBU")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              {copiedField === "CBU" ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div>
              <p
                className="text-xs text-gray-500 mb-1"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Alias
              </p>
              <p
                className="font-medium text-[var(--color-border-base)]"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                {BANK_TRANSFER_INFO.alias}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(BANK_TRANSFER_INFO.alias, "Alias")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              {copiedField === "Alias" ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div>
              <p
                className="text-xs text-gray-500 mb-1"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Banco
              </p>
              <p
                className="font-medium text-[var(--color-border-base)]"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                {BANK_TRANSFER_INFO.bank}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p
            className="text-sm text-yellow-800"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            <strong>Importante:</strong> Una vez realizada la transferencia, debes subir
            el comprobante para que podamos verificar tu pago.
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="proof-upload"
          className="block text-sm font-semibold text-[var(--color-border-base)] mb-2"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          Comprobante de transferencia *
        </label>

        {!selectedFile ? (
          <label
            htmlFor="proof-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
              isSubmitting
                ? "bg-gray-50 cursor-not-allowed opacity-60"
                : "border-[var(--color-border-base)]/30 hover:border-[var(--color-border-base)]/60 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-[var(--color-border-base)]/60" />
              <p
                className="mb-1 text-sm text-[var(--color-border-base)]"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                <span className="font-semibold">Click para subir</span> o arrastra aquí
              </p>
              <p
                className="text-xs text-gray-500"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                PNG, JPG, WebP o PDF (máx. 10MB)
              </p>
            </div>
            <input
              id="proof-upload"
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
          </label>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              {selectedFile.type === "application/pdf" ? (
                <FileText className="w-8 h-8 text-green-600" />
              ) : (
                <ImageIcon className="w-8 h-8 text-green-600" />
              )}
              <div>
                <p
                  className="font-medium text-[var(--color-border-base)]"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  {selectedFile.name}
                </p>
                <p
                  className="text-sm text-gray-600"
                  style={{ fontFamily: "var(--font-nunito)" }}
                >
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankTransferForm;

