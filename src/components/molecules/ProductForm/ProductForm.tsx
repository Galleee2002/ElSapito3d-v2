import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import type { ReactElement } from "react";
import {
  Input,
  Textarea,
  Button,
  ColorListInput,
  CategorySelect,
  ColorSectionsField,
} from "@/components";
import type {
  Product,
  ColorWithName,
  ColorSection,
  Category,
  ColorMode,
} from "@/types";
import { productsService, categoriesService } from "@/services";
import { storageService } from "@/services/storage.service";
import type { UploadResult } from "@/services/storage.service";
import { PREDEFINED_COLORS, getColorByCode, getColorByName } from "@/constants";
import { toSlug, validateModel3DFile, validateVideoFile } from "@/utils";

interface ProductFormProps {
  mode?: "create" | "edit";
  initialProduct?: Product;
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
}

interface ProductFormState {
  colorMode: ColorMode;
  name: string;
  price: string;
  originalPrice: string;
  imageFiles: File[];
  description: string;
  alt: string;
  plasticType: string;
  printTime: string;
  availableColors: ColorWithName[];
  colorSections: ColorSection[];
  stock: string;
  categoryId: string;
  model3DFile: File | null;
  model3DGridPosition: string;
  videoFile: File | null;
}

interface FormErrors {
  name?: string;
  price?: string;
  originalPrice?: string;
  image?: string;
  description?: string;
  alt?: string;
  availableColors?: string;
  colorSections?: string;
  stock?: string;
  categoryId?: string;
  model3DFile?: string;
  model3DGridPosition?: string;
  videoFile?: string;
}

const mapPredefinedColors = (): ColorWithName[] =>
  PREDEFINED_COLORS.map(({ name, code }) => ({
    name,
    code,
  }));

const createColorSectionId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `color-section-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const mapInitialColorSections = (initialProduct?: Product): ColorSection[] => {
  if (
    initialProduct?.colorSections &&
    initialProduct.colorSections.length > 0
  ) {
    return initialProduct.colorSections;
  }

  return [];
};

const ProductForm = ({
  mode = "create",
  initialProduct,
  onSuccess,
  onCancel,
}: ProductFormProps): ReactElement => {
  const isEditMode = mode === "edit";

  const [formValues, setFormValues] = useState<ProductFormState>(() => {
    const initialColors = initialProduct?.availableColors?.length
      ? initialProduct.availableColors.filter(
          (color) => color.name && color.code
        )
      : mapPredefinedColors();

    return {
      colorMode: initialProduct?.colorMode ?? "default",
      name: initialProduct?.name ?? "",
      price: initialProduct ? String(initialProduct.price) : "",
      originalPrice: initialProduct?.originalPrice
        ? String(initialProduct.originalPrice)
        : "",
      imageFiles: [],
      description: initialProduct?.description ?? "",
      alt: initialProduct?.alt ?? "",
      plasticType: initialProduct?.plasticType ?? "",
      printTime: initialProduct?.printTime ?? "",
      availableColors: initialColors,
      colorSections: mapInitialColorSections(initialProduct),
      stock: initialProduct ? String(initialProduct.stock) : "",
      categoryId: initialProduct?.categoryId ?? "",
      model3DFile: null,
      model3DGridPosition:
        initialProduct?.model3DGridPosition !== undefined
          ? String(initialProduct.model3DGridPosition)
          : "",
      videoFile: null,
    };
  });

  const [categories, setCategories] = useState<Category[]>([]);

  const [imagePreviews, setImagePreviews] = useState<string[]>(
    Array.isArray(initialProduct?.image)
      ? initialProduct.image
      : initialProduct?.image
      ? [initialProduct.image]
      : []
  );
  const [videoPreview, setVideoPreview] = useState<string | null>(
    initialProduct?.videoUrl ?? null
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const model3DInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
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

  const handleUploadError = (errorMessage: string): void => {
    setSubmitError(errorMessage);
    setIsSubmitting(false);
  };

  const processUploadErrors = (
    uploadResults: UploadResult[]
  ): string | null => {
    const uploadErrors = uploadResults
      .filter((result) => result.error)
      .map((result) => result.error || "Error desconocido");
    return uploadErrors.length > 0 ? uploadErrors.join(", ") : null;
  };

  const getValidColors = (): ColorWithName[] => {
    return formValues.availableColors.filter(
      (color) => color.name && color.name.trim() !== "" && color.code
    );
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

    if (formValues.originalPrice.trim()) {
      const originalPriceValue = Number(formValues.originalPrice);
      const priceValue = Number(formValues.price);
      if (isNaN(originalPriceValue) || originalPriceValue <= 0) {
        newErrors.originalPrice =
          "El precio original debe ser un número válido mayor a 0";
      } else if (originalPriceValue <= priceValue) {
        newErrors.originalPrice =
          "El precio original (sin descuento) debe ser mayor que el precio con descuento";
      }
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

    const validColors = formValues.availableColors.filter(
      (color) => color.name && color.name.trim() !== "" && color.code
    );

    if (validColors.length === 0) {
      newErrors.availableColors =
        "Debes tener al menos un color válido seleccionado";
    }

    if (formValues.colorMode === "sections") {
      if (formValues.colorSections.length === 0) {
        newErrors.colorSections =
          "Debes definir al menos una sección de color cuando usas el modo por secciones";
      } else {
        const keys = new Set<string>();
        for (const section of formValues.colorSections) {
          const label = section.label.trim();
          const key = section.key.trim();
          const colorId = section.colorId.trim();

          if (!label || !key || !colorId) {
            newErrors.colorSections =
              "Cada sección de color debe tener parte del producto y un color seleccionado";
            break;
          }

          if (keys.has(key)) {
            newErrors.colorSections =
              "Las partes del producto deben tener nombres únicos";
            break;
          }

          keys.add(key);
        }
      }
    }

    if (!formValues.stock.trim()) {
      newErrors.stock = "El stock es requerido";
    } else if (
      !Number.isInteger(Number(formValues.stock)) ||
      Number(formValues.stock) < 0
    ) {
      newErrors.stock = "El stock debe ser un número entero mayor o igual a 0";
    }

    if (formValues.model3DFile) {
      const validationError = validateModel3DFile(formValues.model3DFile);
      if (validationError) {
        newErrors.model3DFile = validationError;
      }
    }

    if (formValues.model3DGridPosition.trim()) {
      const position = Number(formValues.model3DGridPosition);
      if (
        !Number.isInteger(position) ||
        position < 0 ||
        position > imagePreviews.length
      ) {
        newErrors.model3DGridPosition = `La posición debe ser un número entre 0 y ${imagePreviews.length}`;
      }
    }

    if (formValues.videoFile) {
      const validationError = validateVideoFile(formValues.videoFile);
      if (validationError) {
        newErrors.videoFile = validationError;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const errorList = Object.entries(newErrors)
        .map(([, message]) => `• ${message}`)
        .join("\n");
      setSubmitError(`Por favor corrige los siguientes errores:\n${errorList}`);

      setTimeout(() => {
        const firstErrorField = Object.keys(newErrors)[0];
        const errorElement = document.getElementById(firstErrorField);
        errorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
        errorElement?.focus();
      }, 100);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setSubmitError(null);
    setErrors({});

    if (isEditMode && !initialProduct) {
      setSubmitError(
        "No encontramos el producto a editar. Intenta nuevamente."
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    const validColors = getValidColors();

    if (validColors.length === 0) {
      const errorMsg = "Debes tener al menos un color válido seleccionado";
      setErrors((prev) => ({
        ...prev,
        availableColors: errorMsg,
      }));
      setSubmitError(errorMsg);
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

          const errorMessage = processUploadErrors(uploadResults);
          if (errorMessage) {
            handleUploadError(`Error al subir imágenes: ${errorMessage}`);
            return;
          }

          const newUrls = uploadResults
            .map((result) => result.url)
            .filter((url) => url.length > 0);

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

        let model3DUrl = initialProduct?.model3DUrl;
        let model3DPath = initialProduct?.model3DPath;

        if (formValues.model3DFile) {
          const uploadResult = await storageService.uploadModel3D(
            formValues.model3DFile,
            productId
          );

          if (uploadResult.error) {
            handleUploadError(
              `Error al subir modelo 3D: ${uploadResult.error}`
            );
            return;
          }

          model3DUrl = uploadResult.url;
          model3DPath = uploadResult.path;
        }

        let videoUrl = initialProduct?.videoUrl;
        let videoPath = initialProduct?.videoPath;

        if (formValues.videoFile) {
          const uploadResult = await storageService.uploadVideo(
            formValues.videoFile,
            productId
          );

          if (uploadResult.error) {
            handleUploadError(`Error al subir video: ${uploadResult.error}`);
            return;
          }

          videoUrl = uploadResult.url;
          videoPath = uploadResult.path;
        } else if (!videoPreview && initialProduct?.videoUrl) {
          if (initialProduct.videoPath) {
            await storageService.deleteVideo(initialProduct.videoPath);
          }
          videoUrl = undefined;
          videoPath = undefined;
        }

        const productData = {
          name: formValues.name.trim(),
          price: Number(formValues.price),
          originalPrice: formValues.originalPrice.trim()
            ? Number(formValues.originalPrice)
            : undefined,
          image: uploadedImageUrls,
          description: formValues.description.trim(),
          alt: formValues.alt.trim(),
          plasticType: formValues.plasticType.trim() || undefined,
          printTime: formValues.printTime.trim() || undefined,
          availableColors: colorsWithConvertedImages,
          colorMode: formValues.colorMode,
          colorSections:
            formValues.colorMode === "sections" &&
            formValues.colorSections.length > 0
              ? formValues.colorSections
              : undefined,
          stock: Number(formValues.stock),
          categoryId: formValues.categoryId.trim() || undefined,
          model3DUrl,
          model3DPath,
          model3DGridPosition: formValues.model3DGridPosition.trim()
            ? Number(formValues.model3DGridPosition)
            : undefined,
          videoUrl,
          videoPath,
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
          originalPrice: formValues.originalPrice.trim()
            ? Number(formValues.originalPrice)
            : undefined,
          image: ["placeholder"],
          description: formValues.description.trim(),
          alt: formValues.alt.trim(),
          plasticType: formValues.plasticType.trim() || undefined,
          printTime: formValues.printTime.trim() || undefined,
          availableColors: validColors,
          colorMode: formValues.colorMode,
          colorSections:
            formValues.colorMode === "sections" &&
            formValues.colorSections.length > 0
              ? formValues.colorSections
              : undefined,
          stock: Number(formValues.stock),
          categoryId: formValues.categoryId.trim() || undefined,
        };

        const newProduct = await productsService.add(tempProductData);

        // Subir imágenes usando el ID del producto creado
        const uploadResults = await storageService.uploadMultipleImages(
          formValues.imageFiles,
          newProduct.id
        );

        const errorMessage = processUploadErrors(uploadResults);
        if (errorMessage) {
          handleUploadError(`Error al subir imágenes: ${errorMessage}`);
          return;
        }

        const uploadedUrls = uploadResults
          .map((result) => result.url)
          .filter((url) => url.length > 0);

        const finalColorsWithImages = mapColorsWithImages(
          validColors,
          uploadedUrls
        );

        let model3DUrl: string | undefined;
        let model3DPath: string | undefined;

        if (formValues.model3DFile) {
          const uploadResult = await storageService.uploadModel3D(
            formValues.model3DFile,
            newProduct.id
          );

          if (uploadResult.error) {
            handleUploadError(
              `Error al subir modelo 3D: ${uploadResult.error}`
            );
            return;
          }

          model3DUrl = uploadResult.url;
          model3DPath = uploadResult.path;
        }

        let videoUrl: string | undefined;
        let videoPath: string | undefined;

        if (formValues.videoFile) {
          const uploadResult = await storageService.uploadVideo(
            formValues.videoFile,
            newProduct.id
          );

          if (uploadResult.error) {
            handleUploadError(`Error al subir video: ${uploadResult.error}`);
            return;
          }

          videoUrl = uploadResult.url;
          videoPath = uploadResult.path;
        }

        // Actualizar el producto con las URLs reales de las imágenes
        const updatedProduct = await productsService.update(newProduct.id, {
          image: uploadedUrls,
          availableColors: finalColorsWithImages,
          colorMode: formValues.colorMode,
          colorSections:
            formValues.colorMode === "sections" &&
            formValues.colorSections.length > 0
              ? formValues.colorSections
              : undefined,
          categoryId: formValues.categoryId.trim() || undefined,
          model3DUrl,
          model3DPath,
          model3DGridPosition: formValues.model3DGridPosition.trim()
            ? Number(formValues.model3DGridPosition)
            : undefined,
          videoUrl,
          videoPath,
        });

        setFormValues({
          colorMode: "default",
          name: "",
          price: "",
          originalPrice: "",
          imageFiles: [],
          description: "",
          alt: "",
          plasticType: "",
          printTime: "",
          availableColors: [],
          colorSections: [],
          stock: "",
          categoryId: "",
          model3DFile: null,
          model3DGridPosition: "",
          videoFile: null,
        });
        setImagePreviews([]);
        setVideoPreview(null);
        objectUrlsRef.current.forEach((url) => {
          URL.revokeObjectURL(url);
        });
        objectUrlsRef.current = [];
        setErrors({});
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        if (videoInputRef.current) {
          videoInputRef.current.value = "";
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
    K extends Exclude<
      keyof ProductFormState,
      | "imageFiles"
      | "availableColors"
      | "colorSections"
      | "model3DFile"
      | "videoFile"
    >
  >(
    field: K,
    value: ProductFormState[K]
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));

    if (
      field === "name" ||
      field === "price" ||
      field === "originalPrice" ||
      field === "description" ||
      field === "alt" ||
      field === "stock" ||
      field === "categoryId" ||
      field === "model3DGridPosition" ||
      field === "colorMode"
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

  const handleColorSectionsChange = (sections: ColorSection[]) => {
    setFormValues((prev) => ({ ...prev, colorSections: sections }));
    if (errors.colorSections) {
      setErrors((prev) => ({ ...prev, colorSections: undefined }));
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

  const handleModel3DFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationError = validateModel3DFile(file);
    if (validationError) {
      setErrors((prev) => ({
        ...prev,
        model3DFile: validationError,
      }));
      return;
    }

    setFormValues((prev) => ({ ...prev, model3DFile: file }));

    if (errors.model3DFile) {
      setErrors((prev) => ({ ...prev, model3DFile: undefined }));
    }
  };

  const handleRemoveModel3D = () => {
    setFormValues((prev) => ({
      ...prev,
      model3DFile: null,
      model3DGridPosition: "",
    }));

    if (model3DInputRef.current) {
      model3DInputRef.current.value = "";
    }
  };

  const handleVideoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationError = validateVideoFile(file);
    if (validationError) {
      setErrors((prev) => ({
        ...prev,
        videoFile: validationError,
      }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(previewUrl);
    setVideoPreview(previewUrl);
    setFormValues((prev) => ({ ...prev, videoFile: file }));

    if (errors.videoFile) {
      setErrors((prev) => ({ ...prev, videoFile: undefined }));
    }
  };

  const handleRemoveVideo = () => {
    if (videoPreview && videoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreview);
      objectUrlsRef.current = objectUrlsRef.current.filter(
        (url) => url !== videoPreview
      );
    }
    setVideoPreview(null);
    setFormValues((prev) => ({ ...prev, videoFile: null }));

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="border-2 border-border-blue rounded-xl p-4 bg-white/50">
        <label
          htmlFor="colorMode"
          className="block text-sm font-semibold text-[var(--color-contrast-base)] mb-2"
        >
          Modo de visualización de colores *
        </label>
        <select
          id="colorMode"
          className="w-full rounded-xl border-2 border-[var(--color-border-base)] bg-white px-3 py-2 text-sm text-[var(--color-contrast-base)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-base)]"
          value={formValues.colorMode}
          onChange={(event) =>
            handleFieldChange("colorMode", event.target.value as ColorMode)
          }
        >
          <option value="default">
            Colores por defecto (todos los colores disponibles)
          </option>
          <option value="sections">
            Colores por secciones (partes del producto)
          </option>
        </select>
        <p
          className="mt-2 text-xs text-border-blue/70"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          {formValues.colorMode === "default"
            ? "Los usuarios verán todos los colores disponibles del producto."
            : "Los usuarios verán los colores organizados por secciones (ej: Techo, Base, Detalles)."}
        </p>
      </div>

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

        <Input
          id="originalPrice"
          type="number"
          step="0.01"
          label="Precio original sin descuento (opcional)"
          placeholder="Ej: 35.99"
          value={formValues.originalPrice}
          onChange={(event) =>
            handleFieldChange("originalPrice", event.target.value)
          }
          error={errors.originalPrice}
          helperText="Debe ser mayor que el precio con descuento para mostrar el descuento"
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

      {formValues.colorMode === "default" ? (
        <ColorListInput
          id="availableColors"
          label="Colores disponibles *"
          value={formValues.availableColors}
          onChange={handleColorsChange}
          error={errors.availableColors}
          productImages={imagePreviews}
        />
      ) : (
        <div className="border-2 border-dashed border-border-blue rounded-xl p-4 space-y-3">
          <h3
            className="text-lg font-semibold text-border-blue"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Colores por secciones del producto *
          </h3>
          <p
            className="text-sm text-border-blue/70"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Define las partes del producto (ej: Techo, Base, Detalles) y asigna
            un único color en stock a cada una. Los usuarios verán estos colores
            organizados por sección.
          </p>
          <ColorSectionsField
            value={formValues.colorSections}
            onChange={handleColorSectionsChange}
            error={errors.colorSections}
          />
        </div>
      )}

      <div className="space-y-4">
        <div className="border-2 border-dashed border-border-blue rounded-xl p-4">
          <h3
            className="text-lg font-semibold text-border-blue mb-3"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Modelo 3D (opcional)
          </h3>
          <p
            className="text-sm text-border-blue/70 mb-4"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Sube un archivo GLB o GLTF del modelo 3D
          </p>

          {!formValues.model3DFile && (
            <Input
              id="model3DFile"
              type="file"
              accept=".glb,.gltf"
              label="Subir archivo 3D"
              onChange={handleModel3DFileChange}
              ref={model3DInputRef}
              error={errors.model3DFile}
            />
          )}

          {formValues.model3DFile && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      Archivo: {formValues.model3DFile.name}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Tamaño:{" "}
                      {(formValues.model3DFile.size / 1024 / 1024).toFixed(2)}{" "}
                      MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveModel3D}
                    className="ml-3 px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <Input
                id="model3DGridPosition"
                type="number"
                inputMode="numeric"
                min="0"
                max={imagePreviews.length}
                step="1"
                label="Posición en la galería"
                placeholder={`Número entre 0 y ${imagePreviews.length}`}
                value={formValues.model3DGridPosition}
                onChange={(event) =>
                  handleFieldChange("model3DGridPosition", event.target.value)
                }
                error={errors.model3DGridPosition}
              />
              <p className="mt-2 text-xs text-border-blue/60">
                La posición 0 coloca el modelo al inicio, {imagePreviews.length}{" "}
                al final. Si no especificas una posición, el modelo solo
                aparecerá en el visor principal.
              </p>
            </>
          )}
        </div>

        <div className="border-2 border-dashed border-border-blue rounded-xl p-4">
          <h3
            className="text-lg font-semibold text-border-blue mb-3"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Video del producto (opcional)
          </h3>
          <p
            className="text-sm text-border-blue/70 mb-4"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Sube un video del producto (MP4, WebM o MOV, máximo 100MB)
          </p>

          {!videoPreview && (
            <Input
              id="videoFile"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              label="Subir video"
              onChange={handleVideoFileChange}
              ref={videoInputRef}
              error={errors.videoFile}
            />
          )}

          {videoPreview && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    {formValues.videoFile && (
                      <>
                        <p className="text-sm font-medium text-green-800">
                          Archivo: {formValues.videoFile.name}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Tamaño:{" "}
                          {(formValues.videoFile.size / 1024 / 1024).toFixed(2)}{" "}
                          MB
                        </p>
                      </>
                    )}
                    {!formValues.videoFile && initialProduct?.videoUrl && (
                      <p className="text-sm font-medium text-green-800">
                        Video existente del producto
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="ml-3 px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
                <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                  >
                    Tu navegador no soporta la reproducción de videos.
                  </video>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {submitError && (
        <div
          className="p-4 bg-red-50 border-2 border-red-200 rounded-xl"
          role="alert"
          aria-live="assertive"
        >
          <p
            className="text-sm text-red-800 font-semibold whitespace-pre-line"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            {submitError}
          </p>
        </div>
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
