import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Input, Textarea, Button, ColorListInput } from "@/components";
import { Product, ColorWithName } from "@/types";
import { productsService } from "@/services";
import { isValidColor } from "@/utils";

interface ProductFormProps {
  mode?: "create" | "edit";
  initialProduct?: Product;
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
}

interface ProductFormState {
  name: string;
  price: string;
  imageFiles: File[];
  description: string;
  alt: string;
  plasticType: string;
  printTime: string;
  availableColors: ColorWithName[];
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
    imageFiles: [],
    description: initialProduct?.description ?? "",
    alt: initialProduct?.alt ?? "",
    plasticType: initialProduct?.plasticType ?? "",
    printTime: initialProduct?.printTime ?? "",
    availableColors: (initialProduct?.availableColors ?? [
      { code: "#000000", name: "" },
    ]) as ColorWithName[],
    stock: initialProduct ? String(initialProduct.stock) : "",
  }));

  const [imagePreviews, setImagePreviews] = useState<string[]>(
    Array.isArray(initialProduct?.image)
      ? initialProduct.image
      : initialProduct?.image
      ? [initialProduct.image]
      : []
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      objectUrlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!initialProduct) {
      return;
    }

    setFormValues({
      name: initialProduct.name,
      price: String(initialProduct.price),
      imageFiles: [],
      description: initialProduct.description,
      alt: initialProduct.alt ?? "",
      plasticType: initialProduct.plasticType ?? "",
      printTime: initialProduct.printTime ?? "",
      availableColors: (initialProduct.availableColors.length > 0
        ? initialProduct.availableColors
        : [{ code: "#000000", name: "" }]) as ColorWithName[],
      stock: String(initialProduct.stock),
    });
    setImagePreviews(
      Array.isArray(initialProduct.image)
        ? initialProduct.image
        : initialProduct.image
        ? [initialProduct.image]
        : []
    );
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
    } else if (
      isNaN(Number(formValues.price)) ||
      Number(formValues.price) <= 0
    ) {
      newErrors.price = "El precio debe ser un número válido mayor a 0";
    }

    const validColors = formValues.availableColors.filter(
      (color) => color.name.trim() !== "" && isValidColor(color.code)
    );

    if (formValues.imageFiles.length === 0 && imagePreviews.length === 0) {
      newErrors.image = "Al menos una imagen es requerida";
    } else if (
      formValues.imageFiles.some((file) => !file.type.startsWith("image/"))
    ) {
      newErrors.image = "Todos los archivos deben ser imágenes válidas";
    } else if (
      validColors.length > 0 &&
      imagePreviews.length < validColors.length
    ) {
      newErrors.image = `Debes subir al menos una imagen por cada color. Tienes ${validColors.length} color(es) pero solo ${imagePreviews.length} imagen(es)`;
    }

    if (!formValues.description.trim()) {
      newErrors.description = "La descripción del producto es requerida";
    }

    if (!formValues.alt.trim()) {
      newErrors.alt = "El texto alternativo es requerido";
    }

    const hasValidColors = formValues.availableColors.some(
      (color) => color.name.trim() !== "" && isValidColor(color.code)
    );

    if (formValues.availableColors.length === 0 || !hasValidColors) {
      newErrors.availableColors = "Ingresa al menos un color válido con nombre";
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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setSubmitError(null);

    if (isEditMode && !initialProduct) {
      setSubmitError(
        "No encontramos el producto a editar. Intenta nuevamente."
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    const validColors = formValues.availableColors.filter(
      (color) => color.name.trim() !== "" && isValidColor(color.code)
    );

    if (validColors.length === 0) {
      setErrors((prev) => ({
        ...prev,
        availableColors: "Ingresa al menos un color válido con nombre",
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      const existingImages = imagePreviews.filter(
        (preview) => !preview.startsWith("blob:")
      );
      const newImagePromises = formValues.imageFiles.map((file) =>
        readFileAsDataUrl(file)
      );
      const newImages = await Promise.all(newImagePromises);
      const allImages = [...existingImages, ...newImages];

      if (allImages.length === 0) {
        setErrors((prev) => ({
          ...prev,
          image: "Selecciona o conserva al menos una imagen válida",
        }));
        setIsSubmitting(false);
        return;
      }

      if (isEditMode && initialProduct) {
        const updateData = {
          name: formValues.name.trim(),
          price: Number(formValues.price),
          image: allImages as unknown,
          description: formValues.description.trim(),
          alt: formValues.alt.trim(),
          plasticType: formValues.plasticType.trim() || undefined,
          printTime: formValues.printTime.trim() || undefined,
          availableColors: validColors as unknown,
          stock: Number(formValues.stock),
        } as Partial<Omit<Product, "id">>;
        const updatedProduct = await productsService.update(
          initialProduct.id,
          updateData
        );
        onSuccess?.(updatedProduct);
      } else {
        const productData = {
          name: formValues.name.trim(),
          price: Number(formValues.price),
          image: allImages as unknown,
          description: formValues.description.trim(),
          alt: formValues.alt.trim(),
          plasticType: formValues.plasticType.trim() || undefined,
          printTime: formValues.printTime.trim() || undefined,
          availableColors: validColors as unknown,
          stock: Number(formValues.stock),
        } as Omit<Product, "id">;
        const newProduct = await productsService.add(productData);
        onSuccess?.(newProduct);

        setFormValues({
          name: "",
          price: "",
          imageFiles: [],
          description: "",
          alt: "",
          plasticType: "",
          printTime: "",
          availableColors: [{ code: "#000000", name: "" }],
          stock: "",
        });
        setImagePreviews([]);
        objectUrlsRef.current.forEach((url) => {
          URL.revokeObjectURL(url);
        });
        objectUrlsRef.current = [];
        setErrors({});
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocurrió un error al guardar el producto. Intenta nuevamente.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = <
    K extends Exclude<keyof ProductFormState, "imageFiles" | "availableColors">
  >(
    field: K,
    value: ProductFormState[K]
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));

    if (
      field === "name" ||
      field === "price" ||
      field === "description" ||
      field === "alt" ||
      field === "stock"
    ) {
      const errorKey = field as keyof FormErrors;
      if (errors[errorKey]) {
        setErrors((prev) => ({ ...prev, [errorKey]: undefined }));
      }
    }
  };

  const handleColorsChange = (colors: ColorWithName[]) => {
    setFormValues((prev) => ({ ...prev, availableColors: colors }));
    if (errors.availableColors) {
      setErrors((prev) => ({ ...prev, availableColors: undefined }));
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files ?? []);

    if (newFiles.length === 0) {
      return;
    }

    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: undefined }));
    }

    const newPreviews = newFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(previewUrl);
      return previewUrl;
    });

    setFormValues((prev) => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...newFiles],
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const previewToRemove = imagePreviews[index];
    const isBlobUrl = previewToRemove.startsWith("blob:");

    if (isBlobUrl) {
      URL.revokeObjectURL(previewToRemove);
      objectUrlsRef.current = objectUrlsRef.current.filter(
        (url) => url !== previewToRemove
      );

      const blobPreviewsBeforeIndex = imagePreviews
        .slice(0, index)
        .filter((preview) => preview.startsWith("blob:")).length;

      const newFiles = formValues.imageFiles.filter(
        (_, i) => i !== blobPreviewsBeforeIndex
      );
      setFormValues((prev) => ({ ...prev, imageFiles: newFiles }));
    }

    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
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

        <div className="md:col-span-2">
          <Input
            id="image"
            type="file"
            accept="image/*"
            multiple
            label="Imágenes del producto *"
            onChange={handleFileChange}
            ref={fileInputRef}
            error={errors.image}
          />
          {imagePreviews.length > 0 && (
            <p className="mt-2 text-sm text-[var(--color-border-blue)]">
              {imagePreviews.length} archivo(s) seleccionado(s)
            </p>
          )}
          {imagePreviews.length > 0 && (
            <div className="mt-4">
              <p
                className="text-sm text-[var(--color-border-blue)]/70 mb-3"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Vista previa ({imagePreviews.length} imagen
                {imagePreviews.length !== 1 ? "es" : ""})
                {formValues.availableColors.length > 0 && (
                  <span className="block mt-1 text-xs">
                    La primera imagen corresponde al primer color, la segunda al
                    segundo, y así sucesivamente.
                  </span>
                )}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {imagePreviews.map((preview, index) => {
                  const associatedColor = formValues.availableColors[index];
                  const colorName =
                    associatedColor?.name || `Color ${index + 1}`;
                  const colorCode = associatedColor?.code || "#000000";

                  return (
                    <div
                      key={`preview-${index}-${preview.substring(0, 20)}`}
                      className="relative group"
                    >
                      <div className="aspect-square border-2 border-[var(--color-border-blue)] rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={preview}
                          alt={`Vista previa ${index + 1} - ${colorName}`}
                          className="w-full h-full object-cover block"
                          loading="lazy"
                        />
                      </div>
                      {associatedColor && (
                        <div className="absolute bottom-0 left-0 right-0  text-white text-xs px-2 py-1 flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-full border border-white/30"
                            style={{ backgroundColor: colorCode }}
                            aria-label={`Color ${colorName}`}
                          />
                          <span className="truncate">{colorName}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-[var(--color-toad-eyes)] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold z-10 hover:bg-[var(--color-toad-eyes)]/90 shadow-md"
                        aria-label={`Eliminar imagen ${index + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <Input
          id="plasticType"
          label="Tipo de plástico (opcional)"
          placeholder="Ej: PLA, PETG"
          value={formValues.plasticType}
          onChange={(event) =>
            handleFieldChange("plasticType", event.target.value)
          }
        />

        <Input
          id="printTime"
          label="Tiempo de impresión (opcional)"
          placeholder="Ej: 2-3 horas"
          value={formValues.printTime}
          onChange={(event) =>
            handleFieldChange("printTime", event.target.value)
          }
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
        onChange={(event) =>
          handleFieldChange("description", event.target.value)
        }
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

      <ColorListInput
        id="availableColors"
        label="Colores disponibles *"
        value={formValues.availableColors}
        onChange={handleColorsChange}
        error={errors.availableColors}
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
