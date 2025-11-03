import { useState, ChangeEvent, FormEvent } from "react";
import { Upload, Save, X, Trash2 } from "lucide-react";
import { Input, Button, Label, Alert } from "@/components/atoms";
import { cn } from "@/utils";
import type { Model, ModelFormData } from "@/types";
import { modelsService } from "@/services";

interface ModelFormProps {
  model?: Model;
  onSubmit: (formData: ModelFormData) => Promise<void>;
  onCancel: () => void;
  userId: string;
}

const MATERIALS = ["PLA", "ABS", "PETG", "TPU", "Resina"];

const ModelForm = ({ model, onSubmit, onCancel, userId }: ModelFormProps) => {
  const [formData, setFormData] = useState<ModelFormData>({
    name: model?.name || "",
    description: model?.description || "",
    category: model?.category || "",
    material: model?.material || "PLA",
    price: model?.price?.toString() || "",
    print_time: model?.print_time?.toString() || "",
    image_urls: model?.image_urls || (model?.image_url ? [model.image_url] : []),
    is_public: model?.is_public ?? true,
  });

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: checked !== undefined ? checked : value,
    }));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError("");

    const filesArray = Array.from(files);
    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      setUploadingIndex(i);

      try {
        const imageUrl = await modelsService.uploadImage(file, userId);
        setFormData((prev) => ({
          ...prev,
          image_urls: [...prev.image_urls, imageUrl],
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir la imagen");
        break;
      } finally {
        if (i === filesArray.length - 1) {
          setUploadingIndex(null);
        }
      }
    }

    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("El nombre del modelo es obligatorio");
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar el modelo"
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg p-6 mb-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {model ? "Editar Modelo" : "Nuevo Modelo"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {error && <Alert message={error} type="error" />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label>Imágenes del producto</Label>
          {formData.image_urls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {formData.image_urls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-black/10"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className={cn(
                      "absolute top-2 right-2 p-1.5 rounded-full",
                      "bg-red-500 text-white opacity-0 group-hover:opacity-100",
                      "transition-opacity hover:bg-red-600"
                    )}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label
            className={cn(
              "inline-block cursor-pointer bg-[var(--color-surface)] hover:bg-[var(--color-surface)]/90",
              "px-4 py-2 rounded-[var(--radius-md)] flex items-center gap-2 w-fit",
              "border border-black/10 transition-colors",
              uploadingIndex !== null && "opacity-50 cursor-not-allowed"
            )}
          >
            <Upload size={20} />
            {uploadingIndex !== null
              ? `Subiendo ${uploadingIndex + 1}...`
              : formData.image_urls.length > 0
              ? "Añadir más imágenes"
              : "Subir imágenes"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploadingIndex !== null}
            />
          </label>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="name" required>
            Nombre del modelo
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Dragon Low Poly"
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={cn(
              "w-full px-4 py-2 rounded-[var(--radius-md)]",
              "bg-[var(--color-surface)] border border-black/10",
              "text-[var(--color-text)] placeholder:text-[var(--color-text)]/50",
              "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent",
              "transition-all duration-300 resize-none"
            )}
            rows={3}
            placeholder="Describe el modelo..."
          />
        </div>

        <div>
          <Label htmlFor="category">Categoría</Label>
          <Input
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Ej: Decoración, Gaming"
          />
        </div>

        <div>
          <Label htmlFor="material">Material</Label>
          <select
            id="material"
            name="material"
            value={formData.material}
            onChange={handleChange}
            className={cn(
              "w-full px-4 py-2 rounded-[var(--radius-md)]",
              "bg-[var(--color-surface)] border border-black/10",
              "text-[var(--color-text)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent",
              "transition-all duration-300"
            )}
          >
            {MATERIALS.map((material) => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="price">Precio (ARS)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            placeholder="15000.00"
          />
        </div>

        <div>
          <Label htmlFor="print_time">Tiempo de impresión (minutos)</Label>
          <Input
            id="print_time"
            name="print_time"
            type="number"
            step="1"
            value={formData.print_time}
            onChange={handleChange}
            placeholder="120"
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="is_public"
            name="is_public"
            checked={formData.is_public}
            onChange={handleChange}
            className="w-4 h-4 text-[var(--color-primary)] rounded border-black/20"
          />
          <Label htmlFor="is_public" className="mb-0">
            Visible públicamente
          </Label>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="submit" variant="primary" size="md">
          <span className="flex items-center gap-2">
            <Save size={20} />
            {model ? "Guardar cambios" : "Crear modelo"}
          </span>
        </Button>
        <Button type="button" variant="accent" size="md" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default ModelForm;
