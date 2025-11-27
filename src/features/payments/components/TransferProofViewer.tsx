import { FileText, Download, Image as ImageIcon } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { cn } from "@/utils/cn";

interface TransferProofViewerProps {
  url?: string | null;
}

export const TransferProofViewer = ({ url }: TransferProofViewerProps) => {
  if (!url) return null;

  const isPdf = url.toLowerCase().endsWith(".pdf");

  return (
    <SectionCard title="Comprobante de Transferencia" className="mb-4">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {isPdf ? (
              <FileText className="w-8 h-8 text-red-600" />
            ) : (
              <ImageIcon className="w-8 h-8 text-blue-600" />
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">Comprobante de pago</p>
              <p className="text-xs text-gray-500">{isPdf ? "Documento PDF" : "Imagen"}</p>
            </div>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
              "bg-[var(--color-frog-green)] text-white hover:bg-[var(--color-frog-green)]/90"
            )}
          >
            <Download className="w-4 h-4" />
            Ver Original
          </a>
        </div>
        
        {!isPdf && (
          <div className="mt-2 overflow-hidden rounded-lg border border-gray-300">
             <img src={url} alt="Comprobante" className="w-full max-h-64 object-contain bg-gray-200" />
          </div>
        )}
      </div>
    </SectionCard>
  );
};

