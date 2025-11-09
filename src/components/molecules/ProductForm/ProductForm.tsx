import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Input, Textarea, Button } from "@/components";
import { Product } from "@/types";
import { productsService } from "@/services";

interface ProductFormProps {
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
}

interface ProductFormState {
  name: string;
  price: string;
  imageFile: File | null;
  badge: "" | "Nuevo" | "Top";
  alt: string;
  plasticType: string;
  printTime: string;
  availableColors: string;
  stock: string;
}

interface FormErrors {
  name?: string;
  price?: string;
  image?: string;
  alt?: string;
  stock?: string;
}

const ProductForm = ({ onSuccess, onCancel }: ProductFormProps) => {
  const [formValues, setFormValues] = useState<ProductFormState>({
    name: "",
    price: "",
    imageFile: null,
    badge: "",
    alt: "",
    plasticType: "",
    printTime: "",
    availableColors: "",
    stock: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formValues.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formValues.price.trim()) {
      newErrors.price = "El precio es requerido";
    } else if (isNaN(Number(formValues.price)) || Number(formValues.price) <= 0) {
      newErrors.price = "El precio debe ser un número válido mayor a 0";
    }

    if (!formValues.imageFile) {
      newErrors.image = "La imagen principal es requerida";
    } else if (!formValues.imageFile.type.startsWith("image/")) {
      newErrors.image = "El archivo debe ser una imagen válida";
    }

    if (!formValues.alt.trim()) {
      newErrors.alt = "La descripción alternativa es requerida";
    }

    if (!formValues.stock.trim()) {
      newErrors.stock = "El stock es requerido";
    } else if (
      !Number.isInteger(Number(formValues.stock)) ||
      Number(formValues.stock) < 0
    ) {
      newErrors.stock = "El stock debe ser un número entero mayor o igual a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }
        reject(new Error("Formato de imagen inválido"));
      };
      reader.onerror = () => reject(new Error("Error al leer la imagen"));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!formValues.imageFile) {
        setErrors((prev) => ({ ...prev, image: "Selecciona una imagen válida" }));
        return;
      }

      const imageDataUrl = await readFileAsDataUrl(formValues.imageFile);

      const productData = {
        name: formValues.name.trim(),
        price: Number(formValues.price),
        image: imageDataUrl,
        badge: formValues.badge || undefined,
        alt: formValues.alt.trim(),
        plasticType: formValues.plasticType.trim() || undefined,
        printTime: formValues.printTime.trim() || undefined,
        availableColors: formValues.availableColors
          .split(",")
          .map((color) => color.trim())
          .filter(Boolean),
        stock: Number(formValues.stock),
      };

      const newProduct = productsService.add(productData);
      onSuccess?.(newProduct);

      setFormValues({
        name: "",
        price: "",
        imageFile: null,
        badge: "",
        alt: "",
        plasticType: "",
        printTime: "",
        availableColors: "",
        stock: "",
      });
      setErrors({});
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        image:
          prev.image ?? "No se pudo procesar la imagen. Intenta nuevamente.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = <K extends Exclude<keyof ProductFormState, "imageFile">>(
    field: K,
    value: ProductFormState[K]
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));

    if (
      field === "name" ||
      field === "price" ||
      field === "alt" ||
      field === "stock"
    ) {
      const errorKey = field as keyof FormErrors;
      if (errors[errorKey]) {
        setErrors((prev) => ({ ...prev, [errorKey]: undefined }));
      }
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFormValues((prev) => ({ ...prev, imageFile: file }));
    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <Input
          id="name"
          label="Nombre del producto *"
          placeholder="Ej: Sapito de Escritorio"
          value={formValues.name}
          onChange={(e) => handleFieldChange("name", e.target.value)}
          error={errors.name}
          required
        />

        <Input
          id="price"
          type="number"
          step="0.01"
          label="Precio *"
          placeholder="Ej: 25.99"
          value={formValues.price}
          onChange={(e) => handleFieldChange("price", e.target.value)}
          error={errors.price}
          required
        />

        <div>
          <Input
            id="image"
            type="file"
            accept="image/*"
            label="Imagen principal *"
            onChange={handleFileChange}
            ref={fileInputRef}
            error={errors.image}
            required
          />
          {formValues.imageFile && (
            <p className="mt-2 text-sm text-gray-600">
              Archivo seleccionado: {formValues.imageFile.name}
            </p>
          )}
        </div>

        <Input
          id="badge"
          label="Badge (opcional)"
          placeholder="Nuevo o Top"
          value={formValues.badge}
          onChange={(e) =>
            handleFieldChange("badge", e.target.value as "" | "Nuevo" | "Top")
          }
          list="badge-options"
        />
        <datalist id="badge-options">
          <option value="Nuevo" />
          <option value="Top" />
        </datalist>

        <Input
          id="plasticType"
          label="Tipo de plástico (opcional)"
          placeholder="Ej: PLA, PETG"
          value={formValues.plasticType}
          onChange={(e) => handleFieldChange("plasticType", e.target.value)}
        />

        <Input
          id="printTime"
          label="Tiempo de impresión (opcional)"
          placeholder="Ej: 2-3 horas"
          value={formValues.printTime}
          onChange={(e) => handleFieldChange("printTime", e.target.value)}
        />

        <Input
          id="stock"
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          label="Stock disponible *"
          placeholder="Ej: 10"
          value={formValues.stock}
          onChange={(e) => handleFieldChange("stock", e.target.value)}
          error={errors.stock}
          required
        />
      </div>

      <Textarea
        id="alt"
        label="Descripción alternativa *"
        placeholder="Describe la imagen para accesibilidad"
        value={formValues.alt}
        onChange={(e) => handleFieldChange("alt", e.target.value)}
        error={errors.alt}
        required
      />

      <Input
        id="availableColors"
        label="Colores disponibles (opcional)"
        placeholder="Separa con comas: Verde, Azul, Rojo"
        value={formValues.availableColors}
        onChange={(e) => handleFieldChange("availableColors", e.target.value)}
      />

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Guardando..." : "Agregar Producto"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;
