import { Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/atoms";
import { cn } from "@/utils";
import type { Model } from "@/types";

interface ModelCardProps {
  model: Model;
  onEdit: (model: Model) => void;
  onDelete: (id: string) => void;
  onTogglePublic: (model: Model) => void;
}

const ModelCard = ({
  model,
  onEdit,
  onDelete,
  onTogglePublic,
}: ModelCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {model.image_url ? (
        <img
          src={model.image_url}
          alt={model.name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Sin imagen</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-[var(--color-text)] flex-1 pr-2">
            {model.name}
          </h3>
          <button
            onClick={() => onTogglePublic(model)}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            aria-label={model.is_public ? "Ocultar" : "Mostrar"}
          >
            {model.is_public ? (
              <Eye size={18} />
            ) : (
              <EyeOff size={18} />
            )}
          </button>
        </div>

        <p
          className={cn(
            "text-sm text-[var(--color-text)]/70 mb-3 line-clamp-2 min-h-[2.5rem]"
          )}
        >
          {model.description || "Sin descripción"}
        </p>

        <div className="flex items-center justify-between text-sm mb-4">
          <span
            className={cn(
              "bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded",
              "font-medium"
            )}
          >
            {model.material}
          </span>
          <span className="font-semibold text-[var(--color-text)]">
            ${model.price.toFixed(2)}
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => onEdit(model)}
            variant="accent"
            size="sm"
            className="flex-1"
          >
            <span className="flex items-center justify-center gap-2">
              <Edit2 size={16} />
              Editar
            </span>
          </Button>
          <Button
            onClick={() => onDelete(model.id)}
            variant="accent"
            size="sm"
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-700"
          >
            <span className="flex items-center justify-center gap-2">
              <Trash2 size={16} />
              Eliminar
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;

