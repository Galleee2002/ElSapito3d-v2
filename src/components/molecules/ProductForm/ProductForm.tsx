import { ChangeEvent, FormEvent, useEffect, useRef, useState, useCallback } from "react";
import type { ReactElement } from "react";
import { Input, Textarea, Button, ColorListInput, CategorySelect } from "@/components";
import type { Product, ColorWithName, Category } from "@/types";
import { productsService, categoriesService } from "@/services";
import { storageService } from "@/services/storage.service";
import type { UploadResult } from "@/services/storage.service";

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
  categoryId: string;
  model3DUrl: string;
}

interface FormErrors {
  name?: string;
  price?: string;
  image?: string;
  description?: string;
  alt?: string;
  availableColors?: string;
  stock?: string;
  categoryId?: string;
  model3DUrl?: string;
}

const ProductForm = ({
  mode = "create",
  initialProduct,
  onSuccess,
  onCancel,
}: ProductFormProps): ReactElement => {
  const isEditMode = mode === "edit";

  const [formValues, setFormValues] = useState<ProductFormState>(() => ({
    name: initialProduct?.name ?? "",
    price: initialProduct ? String(initialProduct.price) : "",
    imageFiles: [],
    description: initialProduct?.description ?? "",
    alt: initialProduct?.alt ?? "",
    plasticType: initialProduct?.plasticType ?? "",
    printTime: initialProduct?.printTime ?? "",
    availableColors: initialProduct?.availableColors ?? [],
    stock: initialProduct ? String(initialProduct.stock) : "",
    categoryId: initialProduct?.categoryId ?? "",
    model3DUrl: initialProduct?.model3DUrl ?? "",
  }));

  const [categories, setCategories] = useState<Category[]>([]);

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

  const loadCategories = useCallback(async () => {
    try {
      const allCategories = await categoriesService.getAll();
      setCategories(allCategories);
    } catch (error) {
      // Error silenciado - el select maneja el estado vacío
    }
  }, []);

  useEffect(() => {
    void loadCategories();
    const unsubscribe = categoriesService.onCategoriesChanged(loadCategories);
    return unsubscribe;
  }, [loadCategories]);

  const mapColorsWithImages = (
    colors: ColorWithName[],
    imageUrls: string[]
  ): ColorWithName[] => {
    return colors.map((color) => {
      const currentColor = color as ColorWithName & {
        imageIndex?: number;
        image?: string;
      };
      const idx = currentColor.imageIndex ?? -1;
      const hasValidIndex = idx >= 0 && idx < imageUrls.length;

      return {
        code: currentColor.code,
        name: currentColor.name,
        image: hasValidIndex ? imageUrls[idx] : undefined,
        imageIndex: hasValidIndex ? idx : undefined,
      };
    });
  };

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

    if (imagePreviews.length === 0) {
      newErrors.image = "Al menos una imagen es requerida";
    } else if (
      formValues.imageFiles.length > 0 &&
      formValues.imageFiles.some((file) => !file.type.startsWith("image/"))
    ) {
      newErrors.image = "Todos los archivos deben ser imágenes válidas";
    }

    if (!formValues.description.trim()) {
      newErrors.description = "La descripción del producto es requerida";
    }

    if (!formValues.alt.trim()) {
      newErrors.alt = "El texto alternativo es requerido";
    }

    const hasValidColors = formValues.availableColors.some(
      (color) => color.name.trim() !== ""
    );

    if (formValues.availableColors.length === 0 || !hasValidColors) {
      newErrors.availableColors = "Selecciona al menos un color";
    }

    if (!formValues.stock.trim()) {
      newErrors.stock = "El stock es requerido";
    } else if (
      !Number.isInteger(Number(formValues.stock)) ||
      Number(formValues.stock) < 0
    ) {
      newErrors.stock = "El stock debe ser un número entero mayor o igual a 0";
    }

    if (formValues.model3DUrl.trim()) {
      try {
        new URL(formValues.model3DUrl.trim());
      } catch {
        newErrors.model3DUrl = "La URL del modelo 3D no es válida";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

    const validColors: ColorWithName[] = formValues.availableColors.filter(
      (color: ColorWithName) => color.name.trim() !== ""
    );

    if (validColors.length === 0) {
      setErrors((prev) => ({
        ...prev,
        availableColors: "Selecciona al menos un color",
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      const existingImages = imagePreviews.filter(
        (preview) =>
          !preview.startsWith("blob:") && !preview.startsWith("data:")
      );

      let uploadedImageUrls: string[] = [...existingImages];

      if (isEditMode && initialProduct) {
        const productId = initialProduct.id;

        if (formValues.imageFiles.length > 0) {
          const uploadResults = await storageService.uploadMultipleImages(
            formValues.imageFiles,
            productId
          );

          const uploadErrors = uploadResults
            .filter((result: UploadResult) => result.error)
            .map((result: UploadResult) => result.error || "Error desconocido");

          if (uploadErrors.length > 0) {
            setSubmitError(
              `Error al subir imágenes: ${uploadErrors.join(", ")}`
            );
            setIsSubmitting(false);
            return;
          }

          const newUrls = uploadResults
            .map((result: UploadResult) => result.url)
            .filter((url: string) => url.length > 0);

          uploadedImageUrls = [...existingImages, ...newUrls];
        }

        if (uploadedImageUrls.length === 0) {
          setErrors((prev) => ({
            ...prev,
            image: "Selecciona o conserva al menos una imagen válida",
          }));
          setIsSubmitting(false);
          return;
        }

        const colorsWithConvertedImages = mapColorsWithImages(
          validColors,
          uploadedImageUrls
        );

        const productData = {
          name: formValues.name.trim(),
          price: Number(formValues.price),
          image: uploadedImageUrls,
          description: formValues.description.trim(),
          alt: formValues.alt.trim(),
          plasticType: formValues.plasticType.trim() || undefined,
          printTime: formValues.printTime.trim() || undefined,
          availableColors: colorsWithConvertedImages,
          stock: Number(formValues.stock),
          categoryId: formValues.categoryId.trim() || undefined,
          model3DUrl: formValues.model3DUrl.trim() || undefined,
        };

        const updatedProduct = await productsService.update(
          productId,
          productData
        );
        onSuccess?.(updatedProduct);
      } else {
        if (formValues.imageFiles.length === 0) {
          setErrors((prev) => ({
            ...prev,
            image: "Selecciona al menos una imagen",
          }));
          setIsSubmitting(false);
          return;
        }

        // Crear producto temporal con placeholder para obtener el ID
        const tempProductData = {
          name: formValues.name.trim(),
          price: Number(formValues.price),
          image: ["placeholder"],
          description: formValues.description.trim(),
          alt: formValues.alt.trim(),
          plasticType: formValues.plasticType.trim() || undefined,
          printTime: formValues.printTime.trim() || undefined,
          availableColors: [],
          stock: Number(formValues.stock),
          categoryId: formValues.categoryId.trim() || undefined,
        };

        const newProduct = await productsService.add(tempProductData);

        // Subir imágenes usando el ID del producto creado
        const uploadResults = await storageService.uploadMultipleImages(
          formValues.imageFiles,
          newProduct.id
        );

        const uploadErrors = uploadResults
          .filter((result: UploadResult) => result.error)
          .map((result: UploadResult) => result.error || "Error desconocido");

        if (uploadErrors.length > 0) {
          setSubmitError(`Error al subir imágenes: ${uploadErrors.join(", ")}`);
          setIsSubmitting(false);
          return;
        }

        const uploadedUrls = uploadResults
          .map((result: UploadResult) => result.url)
          .filter((url: string) => url.length > 0);

        const finalColorsWithImages = mapColorsWithImages(
          validColors,
          uploadedUrls
        );

        // Actualizar el producto con las URLs reales de las imágenes
        const updatedProduct = await productsService.update(newProduct.id, {
          image: uploadedUrls,
          availableColors: finalColorsWithImages,
          categoryId: formValues.categoryId.trim() || undefined,
          model3DUrl: formValues.model3DUrl.trim() || undefined,
        });

        setFormValues({
          name: "",
          price: "",
          imageFiles: [],
          description: "",
          alt: "",
          plasticType: "",
          printTime: "",
          availableColors: [],
          stock: "",
          categoryId: "",
          model3DUrl: "",
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

        onSuccess?.(updatedProduct);
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
      field === "stock" ||
      field === "categoryId" ||
      field === "model3DUrl"
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
            <p className="mt-2 text-sm text-border-blue">
              {imagePreviews.length} archivo(s) seleccionado(s)
            </p>
          )}
          {imagePreviews.length > 0 && (
            <div className="mt-4">
              <p
                className="text-sm text-border-blue/70 mb-3"
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
                      <div className="aspect-square border-2 border-border-blue rounded-xl overflow-hidden bg-gray-100">
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
                        className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-toad-eyes text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold z-10 hover:bg-toad-eyes/90 shadow-md"
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

        <CategorySelect
          id="categoryId"
          label="Categoría (opcional)"
          value={formValues.categoryId}
          options={categories.map((cat) => ({ id: cat.id, name: cat.name }))}
          onChange={(value) => handleFieldChange("categoryId", value)}
          placeholder="Sin categoría"
          error={errors.categoryId}
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
        productImages={imagePreviews}
      />

      <Input
        id="model3DUrl"
        type="url"
        label="URL del modelo 3D (opcional)"
        placeholder="https://tu-proyecto.supabase.co/storage/v1/object/public/..."
        value={formValues.model3DUrl}
        onChange={(event) =>
          handleFieldChange("model3DUrl", event.target.value)
        }
        error={errors.model3DUrl}
      />

      {submitError && (
        <p
          className="text-sm text-toad-eyes"
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
