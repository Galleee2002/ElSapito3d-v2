import { supabase } from "./supabase";

const BUCKET_NAME = "product-images";
const MODELS_BUCKET_NAME = "product-models";
const VIDEOS_BUCKET_NAME = "product-videos";
const PAYMENT_PROOFS_BUCKET_NAME = "payment-proofs";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_MODEL_FILE_SIZE = 50 * 1024 * 1024;
const MAX_VIDEO_FILE_SIZE = 100 * 1024 * 1024;
const MAX_PROOF_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"];

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("No se pudo procesar el archivo"));
        return;
      }

      const [, base64] = result.split(",");
      if (!base64) {
        reject(new Error("No se pudo convertir el archivo a base64"));
        return;
      }

      resolve(base64);
    };
    reader.onerror = () => {
      reject(
        reader.error instanceof Error
          ? reader.error
          : new Error("Error al leer el archivo")
      );
    };
    reader.readAsDataURL(file);
  });
};

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

export const storageService = {
  async uploadImage(
    file: File,
    productId: string,
    imageIndex: number = 0
  ): Promise<UploadResult> {
    if (!file) {
      return {
        url: "",
        path: "",
        error: "No se proporcionó ningún archivo",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        url: "",
        path: "",
        error: `El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        url: "",
        path: "",
        error: "Tipo de archivo no permitido. Solo se permiten JPEG, PNG y WebP",
      };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${productId}/${imageIndex}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        return {
          url: "",
          path: "",
          error: error.message,
        };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath,
      };
    } catch (error) {
      return {
        url: "",
        path: "",
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al subir la imagen",
      };
    }
  },

  async uploadMultipleImages(
    files: File[],
    productId: string
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file, index) =>
      this.uploadImage(file, productId, index)
    );

    return Promise.all(uploadPromises);
  },

  async deleteImage(path: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al eliminar la imagen",
      };
    }
  },

  async deleteProductImages(productId: string): Promise<{ error?: string }> {
    try {
      const { data: files, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(productId, {
          limit: 100,
          offset: 0,
        });

      if (listError) {
        return { error: listError.message };
      }

      if (!files || files.length === 0) {
        return {};
      }

      const filePaths = files.map((file) => `${productId}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths);

      if (deleteError) {
        return { error: deleteError.message };
      }

      return {};
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al eliminar las imágenes",
      };
    }
  },

  getPublicUrl(path: string): string {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
  },

  async uploadModel3D(
    file: File,
    productId: string
  ): Promise<UploadResult> {
    if (!file) {
      return {
        url: "",
        path: "",
        error: "No se proporcionó ningún archivo",
      };
    }

    if (file.size > MAX_MODEL_FILE_SIZE) {
      return {
        url: "",
        path: "",
        error: `El archivo es demasiado grande. Máximo ${MAX_MODEL_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!fileExt || !["glb", "gltf"].includes(fileExt)) {
      return {
        url: "",
        path: "",
        error: "Tipo de archivo no permitido. Solo se permiten archivos GLB y GLTF",
      };
    }

    const fileName = `${productId}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const contentType = fileExt === "glb" 
      ? "model/gltf-binary" 
      : "model/gltf+json";

    try {
      const { error } = await supabase.storage
        .from(MODELS_BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType,
        });

      if (error) {
        return {
          url: "",
          path: "",
          error: error.message,
        };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(MODELS_BUCKET_NAME).getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath,
      };
    } catch (error) {
      return {
        url: "",
        path: "",
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al subir el modelo 3D",
      };
    }
  },

  async deleteModel3D(path: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(MODELS_BUCKET_NAME)
        .remove([path]);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al eliminar el modelo 3D",
      };
    }
  },

  async deleteProductModel3D(productId: string): Promise<{ error?: string }> {
    try {
      const { data: files, error: listError } = await supabase.storage
        .from(MODELS_BUCKET_NAME)
        .list(productId, {
          limit: 100,
          offset: 0,
        });

      if (listError) {
        return { error: listError.message };
      }

      if (!files || files.length === 0) {
        return {};
      }

      const filePaths = files.map((file) => `${productId}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from(MODELS_BUCKET_NAME)
        .remove(filePaths);

      if (deleteError) {
        return { error: deleteError.message };
      }

      return {};
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al eliminar los modelos 3D",
      };
    }
  },

  getModel3DPublicUrl(path: string): string {
    const { data } = supabase.storage.from(MODELS_BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
  },

  async uploadVideo(
    file: File,
    productId: string
  ): Promise<UploadResult> {
    if (!file) {
      return {
        url: "",
        path: "",
        error: "No se proporcionó ningún archivo",
      };
    }

    if (file.size > MAX_VIDEO_FILE_SIZE) {
      return {
        url: "",
        path: "",
        error: `El archivo es demasiado grande. Máximo ${MAX_VIDEO_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return {
        url: "",
        path: "",
        error: "Tipo de archivo no permitido. Solo se permiten MP4, WebM y QuickTime",
      };
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const fileName = `${productId}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Determinar el contentType correcto basado en la extensión
    let contentType = file.type;
    if (fileExt === "mp4") {
      contentType = "video/mp4";
    } else if (fileExt === "webm") {
      contentType = "video/webm";
    } else if (fileExt === "mov") {
      contentType = "video/quicktime";
    }

    try {
      const { error } = await supabase.storage
        .from(VIDEOS_BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: contentType,
        });

      if (error) {
        return {
          url: "",
          path: "",
          error: error.message,
        };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(VIDEOS_BUCKET_NAME).getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath,
      };
    } catch (error) {
      return {
        url: "",
        path: "",
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al subir el video",
      };
    }
  },

  async deleteVideo(path: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(VIDEOS_BUCKET_NAME)
        .remove([path]);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al eliminar el video",
      };
    }
  },

  async deleteProductVideo(productId: string): Promise<{ error?: string }> {
    try {
      const { data: files, error: listError } = await supabase.storage
        .from(VIDEOS_BUCKET_NAME)
        .list(productId, {
          limit: 100,
          offset: 0,
        });

      if (listError) {
        return { error: listError.message };
      }

      if (!files || files.length === 0) {
        return {};
      }

      const filePaths = files.map((file) => `${productId}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from(VIDEOS_BUCKET_NAME)
        .remove(filePaths);

      if (deleteError) {
        return { error: deleteError.message };
      }

      return {};
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al eliminar el video",
      };
    }
  },

  getVideoPublicUrl(path: string): string {
    const { data } = supabase.storage.from(VIDEOS_BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
  },

  async uploadPaymentProof(
    file: File,
    paymentId: string
  ): Promise<UploadResult> {
    if (!file) {
      return {
        url: "",
        path: "",
        error: "No se proporcionó ningún archivo",
      };
    }

    if (file.size > MAX_PROOF_FILE_SIZE) {
      return {
        url: "",
        path: "",
        error: `El archivo es demasiado grande. Máximo ${MAX_PROOF_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    if (!ALLOWED_PROOF_TYPES.includes(file.type)) {
      return {
        url: "",
        path: "",
        error: "Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP) y PDF",
      };
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        url: "",
        path: "",
        error: "Supabase configuration missing",
      };
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "";

    try {
      const base64Content = await readFileAsBase64(file);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || supabaseAnonKey;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/upload-payment-proof`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            directory: paymentId,
            fileName: file.name,
            fileExt,
            contentType: file.type,
            size: file.size,
            base64: base64Content,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Error desconocido al subir el comprobante" }));
        return {
          url: "",
          path: "",
          error: errorData.error || "Error al subir el comprobante",
        };
      }

      const result = await response.json();
      return {
        url: result.url,
        path: result.path,
      };
    } catch (error) {
      return {
        url: "",
        path: "",
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al subir el comprobante",
      };
    }
  },

  async deletePaymentProof(path: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(PAYMENT_PROOFS_BUCKET_NAME)
        .remove([path]);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido al eliminar el comprobante",
      };
    }
  },

  getPaymentProofPublicUrl(path: string): string {
    const { data } = supabase.storage.from(PAYMENT_PROOFS_BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
  },
};
