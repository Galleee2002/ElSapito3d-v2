import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Input, Textarea, Button } from "@/components";
import { Product } from "@/types";
import { productsService } from "@/services";

interface ProductFormProps {
  mode?: "create" | "edit";
  initialProduct?: Product;
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
}

interface ProductFormState {
  name: string;
  price: string;
  imageFile: File | null;
  description: string;
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
  description?: string;
  alt?: string;
  availableColors?: string;
  stock?: string;
}

const ProductForm = ({
  mode = "create",
  initialProduct,
  onSuccess,
  onCancel,
}: ProductFormProps) => {
  const isEditMode = mode === "edit";

  const [formValues, setFormValues] = useState<ProductFormState>(() => ({
    name: initialProduct?.name ?? "",
    price: initialProduct ? String(initialProduct.price) : "",
    imageFile: null,
    description: initialProduct?.description ?? "",
    alt: initialProduct?.alt ?? "",
    plasticType: initialProduct?.plasticType ?? "",
    printTime: initialProduct?.printTime ?? "",
    availableColors: initialProduct?.availableColors?.join(", ") ?? "",
    stock: initialProduct ? String(initialProduct.stock) : "",
  }));

  const [imagePreview, setImagePreview] = useState<string | null>(
    initialProduct?.image ?? null
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!initialProduct) {
      return;
    }

    setFormValues({
      name: initialProduct.name,
      price: String(initialProduct.price),
      imageFile: null,
      description: initialProduct.description,
      alt: initialProduct.alt ?? "",
      plasticType: initialProduct.plasticType ?? "",
      printTime: initialProduct.printTime ?? "",
      availableColors: initialProduct.availableColors.join(", "),
      stock: String(initialProduct.stock),
    });
    setImagePreview(initialProduct.image ?? null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErrors({});
    setSubmitError(null);
  }, [initialProduct]);

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

    if (!formValues.imageFile && !imagePreview) {
      newErrors.image = "La imagen principal es requerida";
    } else if (
      formValues.imageFile &&
      !formValues.imageFile.type.startsWith("image/")
    ) {
      newErrors.image = "El archivo debe ser una imagen válida";
    }

    if (!formValues.description.trim()) {
      newErrors.description = "La descripción del producto es requerida";
    }

    if (!formValues.alt.trim()) {
      newErrors.alt = "El texto alternativo es requerido";
    }

    if (!formValues.availableColors.trim()) {
      newErrors.availableColors = "Ingresa al menos un color disponible";
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

  const parseAvailableColors = (value: string): string[] =>
    value
      .split(",")
      .map((color) => color.trim())
      .filter((color) => color.length > 0);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setSubmitError(null);

    if (isEditMode && !initialProduct) {
      setSubmitError("No encontramos el producto a editar. Intenta nuevamente.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    const colors = parseAvailableColors(formValues.availableColors);
    if (colors.length === 0) {
      setErrors((prev) => ({
        ...prev,
        availableColors: "Ingresa al menos un color disponible",
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      let imageDataUrl = imagePreview ?? "";
      if (formValues.imageFile) {
        imageDataUrl = await readFileAsDataUrl(formValues.imageFile);
      }

      if (!imageDataUrl) {
        setErrors((prev) => ({
          ...prev,
          image: "Selecciona o conserva una imagen válida",
        }));
        return;
      }

      const productData = {
        name: formValues.name.trim(),
        price: Number(formValues.price),
        image: imageDataUrl,
        description: formValues.description.trim(),
        alt: formValues.alt.trim(),
        plasticType: formValues.plasticType.trim() || undefined,
        printTime: formValues.printTime.trim() || undefined,
        availableColors: colors,
        stock: Number(formValues.stock),
      };

      if (isEditMode && initialProduct) {
        const updatedProduct = productsService.update(
          initialProduct.id,
          productData
        );
        if (!updatedProduct) {
          setSubmitError(
            "No pudimos actualizar el producto. Intenta nuevamente."
          );
          return;
        }
        onSuccess?.(updatedProduct);
      } else {
        const newProduct = productsService.add(productData);
        onSuccess?.(newProduct);

        setFormValues({
          name: "",
          price: "",
          imageFile: null,
          description: "",
          alt: "",
          plasticType: "",
          printTime: "",
          availableColors: "",
          stock: "",
        });
        setImagePreview(null);
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
        setErrors({});
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch {
      setSubmitError(
        "Ocurrió un error al guardar el producto. Intenta nuevamente."
      );
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
      field === "description" ||
      field === "alt" ||
      field === "availableColors" ||
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

    if (!file) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setImagePreview(initialProduct?.image ?? null);
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;
    setImagePreview(previewUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <Input
          id="name"
          label="Nombre del producto *"
          placeholder="Ej: Sapito de Escritorio"
          value={formValues.name}
          onChange={(event) => handleFieldChange("name", event.target.value)}
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
          onChange={(event) => handleFieldChange("price", event.target.value)}
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
            required={!isEditMode}
          />
          {formValues.imageFile && (
            <p className="mt-2 text-sm text-gray-600">
              Archivo seleccionado: {formValues.imageFile.name}
            </p>
          )}
          {imagePreview && (
            <div className="mt-3">
              <p
                className="text-sm text-[var(--color-border-blue)]/70 mb-2"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Vista previa
              </p>
              <div className="w-full max-w-[180px] aspect-square border-2 border-[var(--color-border-blue)] rounded-xl overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Vista previa del producto"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        <Input
          id="plasticType"
          label="Tipo de plástico (opcional)"
          placeholder="Ej: PLA, PETG"
          value={formValues.plasticType}
          onChange={(event) => handleFieldChange("plasticType", event.target.value)}
        />

        <Input
          id="printTime"
          label="Tiempo de impresión (opcional)"
          placeholder="Ej: 2-3 horas"
          value={formValues.printTime}
          onChange={(event) => handleFieldChange("printTime", event.target.value)}
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
          onChange={(event) => handleFieldChange("stock", event.target.value)}
          error={errors.stock}
          required
        />
      </div>

      <Textarea
        id="description"
        label="Descripción del producto *"
        placeholder="Describe en detalle el producto"
        value={formValues.description}
        onChange={(event) => handleFieldChange("description", event.target.value)}
        error={errors.description}
        required
      />

      <Textarea
        id="alt"
        label="Texto alternativo para la imagen *"
        placeholder="Describe la imagen para accesibilidad"
        value={formValues.alt}
        onChange={(event) => handleFieldChange("alt", event.target.value)}
        error={errors.alt}
        required
      />

      <Input
        id="availableColors"
        label="Colores disponibles *"
        placeholder="Separa con comas: Verde, Azul, Rojo"
        value={formValues.availableColors}
        onChange={(event) => handleFieldChange("availableColors", event.target.value)}
        error={errors.availableColors}
        required
      />

      {submitError && (
        <p
          className="text-sm text-[var(--color-toad-eyes)]"
          style={{ fontFamily: "var(--font-nunito)" }}
          role="alert"
        >
          {submitError}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting
            ? "Guardando..."
            : isEditMode
            ? "Guardar Cambios"
            : "Agregar Producto"}
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
