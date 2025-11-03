import { supabase } from "./supabase";
import type { Model, ModelFormData } from "@/types";

const normalizeModel = (model: any): Model => {
  if (model.image_urls && Array.isArray(model.image_urls)) {
    return { ...model, image_urls: model.image_urls };
  }
  if (model.image_url) {
    return { ...model, image_urls: [model.image_url] };
  }
  return { ...model, image_urls: [] };
};

export const modelsService = {
  getAll: async (): Promise<Model[]> => {
    const { data, error } = await supabase
      .from("models")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(normalizeModel);
  },

  getPublic: async (): Promise<Model[]> => {
    const { data, error } = await supabase
      .from("models")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(normalizeModel);
  },

  getById: async (id: string): Promise<Model | null> => {
    const { data, error } = await supabase
      .from("models")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data ? normalizeModel(data) : null;
  },

  create: async (formData: ModelFormData, userId: string): Promise<Model> => {
    const images = formData.image_urls.length > 0 ? formData.image_urls : [];
    const modelData: any = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      material: formData.material,
      price: parseFloat(formData.price) || 0,
      print_time: parseInt(formData.print_time) || 0,
      is_public: formData.is_public,
      user_id: userId,
    };

    if (images.length === 1) {
      modelData.image_url = images[0];
    } else if (images.length > 1) {
      modelData.image_urls = images;
    }

    const { data, error } = await supabase
      .from("models")
      .insert([modelData])
      .select()
      .single();

    if (error) throw error;
    return normalizeModel(data);
  },

  update: async (id: string, formData: ModelFormData): Promise<Model> => {
    const images = formData.image_urls.length > 0 ? formData.image_urls : [];
    const modelData: any = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      material: formData.material,
      price: parseFloat(formData.price) || 0,
      print_time: parseInt(formData.print_time) || 0,
      is_public: formData.is_public,
    };

    if (images.length === 1) {
      modelData.image_url = images[0];
      modelData.image_urls = null;
    } else if (images.length > 1) {
      modelData.image_urls = images;
      modelData.image_url = null;
    } else {
      modelData.image_url = null;
      modelData.image_urls = null;
    }

    const { data, error } = await supabase
      .from("models")
      .update(modelData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return normalizeModel(data);
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
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("model-images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("model-images").getPublicUrl(filePath);

    return publicUrl;
  },
};
