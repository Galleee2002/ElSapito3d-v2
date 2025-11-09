import { useState, FormEvent } from "react";
import { Input, Textarea, Button } from "@/components";
import { Product } from "@/types";
import { productsService } from "@/services";

interface ProductFormProps {
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
}

interface FormData {
  name: string;
  price: string;
  image: string;
  images: string;
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
  const [formData, setFormData] = useState<FormData>({
    name: "",
    price: "",
    image: "",
    images: "",
    badge: "",
    alt: "",
    plasticType: "",
    printTime: "",
    availableColors: "",
    stock: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.price.trim()) {
      newErrors.price = "El precio es requerido";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "El precio debe ser un número válido mayor a 0";
    }

    if (!formData.image.trim()) {
      newErrors.image = "La URL de la imagen es requerida";
    } else if (!isValidUrl(formData.image)) {
      newErrors.image = "Debe ser una URL válida";
    }

    if (!formData.alt.trim()) {
      newErrors.alt = "La descripción alternativa es requerida";
    }

    if (!formData.stock.trim()) {
      newErrors.stock = "El stock es requerido";
    } else if (
      !Number.isInteger(Number(formData.stock)) ||
      Number(formData.stock) < 0
    ) {
      newErrors.stock = "El stock debe ser un número entero mayor o igual a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name.trim(),
        price: Number(formData.price),
        image: formData.image.trim(),
        images: formData.images
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean),
        badge: formData.badge || undefined,
        alt: formData.alt.trim(),
        plasticType: formData.plasticType.trim() || undefined,
        printTime: formData.printTime.trim() || undefined,
        availableColors: formData.availableColors
          .split(",")
          .map((color) => color.trim())
          .filter(Boolean),
        stock: Number(formData.stock),
      };

      const newProduct = productsService.add(productData);
      onSuccess?.(newProduct);

      setFormData({
        name: "",
        price: "",
        image: "",
        images: "",
        badge: "",
        alt: "",
        plasticType: "",
        printTime: "",
        availableColors: "",
        stock: "",
      });
      setErrors({});
    } catch {
      // Error silencioso
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    field: keyof FormData,
    value: string | "" | "Nuevo" | "Top"
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <Input
          id="name"
          label="Nombre del producto *"
          placeholder="Ej: Sapito de Escritorio"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          required
        />

        <Input
          id="price"
          type="number"
          step="0.01"
          label="Precio *"
          placeholder="Ej: 25.99"
          value={formData.price}
          onChange={(e) => handleChange("price", e.target.value)}
          error={errors.price}
          required
        />

        <Input
          id="image"
          type="url"
          label="URL de imagen principal *"
          placeholder="https://ejemplo.com/imagen.jpg"
          value={formData.image}
          onChange={(e) => handleChange("image", e.target.value)}
          error={errors.image}
          required
        />

        <Input
          id="badge"
          label="Badge (opcional)"
          placeholder="Nuevo o Top"
          value={formData.badge}
          onChange={(e) =>
            handleChange("badge", e.target.value as "" | "Nuevo" | "Top")
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
          value={formData.plasticType}
          onChange={(e) => handleChange("plasticType", e.target.value)}
        />

        <Input
          id="printTime"
          label="Tiempo de impresión (opcional)"
          placeholder="Ej: 2-3 horas"
          value={formData.printTime}
          onChange={(e) => handleChange("printTime", e.target.value)}
        />

        <Input
          id="stock"
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          label="Stock disponible *"
          placeholder="Ej: 10"
          value={formData.stock}
          onChange={(e) => handleChange("stock", e.target.value)}
          error={errors.stock}
          required
        />
      </div>

      <Textarea
        id="alt"
        label="Descripción alternativa *"
        placeholder="Describe la imagen para accesibilidad"
        value={formData.alt}
        onChange={(e) => handleChange("alt", e.target.value)}
        error={errors.alt}
        required
      />

      <Textarea
        id="images"
        label="URLs de imágenes adicionales (opcional)"
        placeholder="Separa múltiples URLs con comas: https://ejemplo.com/img1.jpg, https://ejemplo.com/img2.jpg"
        value={formData.images}
        onChange={(e) => handleChange("images", e.target.value)}
      />

      <Input
        id="availableColors"
        label="Colores disponibles (opcional)"
        placeholder="Separa con comas: Verde, Azul, Rojo"
        value={formData.availableColors}
        onChange={(e) => handleChange("availableColors", e.target.value)}
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
