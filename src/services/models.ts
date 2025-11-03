import { supabase } from "./supabase";
import type { Model, ModelFormData } from "@/types";

const normalizeModel = (model: Model | null): Model | null => {
  if (!model) return null;
  return {
    ...model,
    image_urls: model.image_urls || [],
    video_urls: model.video_urls || [],
    colors: model.colors || [],
  };
};

const normalizeModels = (models: Model[]): Model[] => {
  return models.map(normalizeModel).filter((m): m is Model => m !== null);
};

const uploadFile = async (
  file: File,
  userId: string,
  bucket: string,
  options?: { cacheControl?: string; upsert?: boolean }
): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const uploadOptions = options?.cacheControl ? { cacheControl: options.cacheControl, upsert: options.upsert } : undefined;
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, uploadOptions);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return publicUrl;
};

export const modelsService = {
  getAll: async (): Promise<Model[]> => {
    const { data, error } = await supabase
      .from("models")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return normalizeModels(data || []);
  },

  getPublic: async (): Promise<Model[]> => {
    const { data, error } = await supabase
      .from("models")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return normalizeModels(data || []);
  },

  getById: async (id: string): Promise<Model | null> => {
    const { data, error } = await supabase
      .from("models")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return normalizeModel(data);
  },

  create: async (formData: ModelFormData, userId: string): Promise<Model> => {
    const modelData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      print_time: parseInt(formData.print_time) || 0,
      image_urls: formData.image_urls || [],
      video_urls: formData.video_urls || [],
      colors: formData.colors || [],
      user_id: userId,
    };

    const { data, error } = await supabase
      .from("models")
      .insert([modelData])
      .select()
      .single();

    if (error) throw error;
    return normalizeModel(data)!;
  },

  update: async (id: string, formData: ModelFormData): Promise<Model> => {
    const modelData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      print_time: parseInt(formData.print_time) || 0,
      image_urls: formData.image_urls || [],
      video_urls: formData.video_urls || [],
      colors: formData.colors || [],
    };

    const { data, error } = await supabase
      .from("models")
      .update(modelData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return normalizeModel(data)!;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("models").delete().eq("id", id);
    if (error) throw error;
  },

  togglePublic: async (id: string, isPublic: boolean): Promise<void> => {
    const { error } = await supabase
      .from("models")
      .update({ is_public: !isPublic })
      .eq("id", id);

    if (error) throw error;
  },

  uploadImage: async (file: File, userId: string): Promise<string> => {
    return uploadFile(file, userId, "model-images");
  },

  uploadVideo: async (file: File, userId: string): Promise<string> => {
    return uploadFile(file, userId, "model-videos", {
      cacheControl: "3600",
      upsert: false,
    });
  },
};
