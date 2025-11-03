import { supabase } from "./supabase";
import type { Model, ModelFormData } from "@/types";

export const modelsService = {
  getAll: async (): Promise<Model[]> => {
    const { data, error } = await supabase
      .from("models")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((model) => ({
      ...model,
      image_urls: model.image_urls || [],
    }));
  },

  getPublic: async (): Promise<Model[]> => {
    const { data, error } = await supabase
      .from("models")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((model) => ({
      ...model,
      image_urls: model.image_urls || [],
    }));
  },

  getById: async (id: string): Promise<Model | null> => {
    const { data, error } = await supabase
      .from("models")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return null;
    return {
      ...data,
      image_urls: data.image_urls || [],
    };
  },

  create: async (formData: ModelFormData, userId: string): Promise<Model> => {
    const modelData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      print_time: parseInt(formData.print_time) || 0,
      image_urls: formData.image_urls || [],
      user_id: userId,
    };

    const { data, error } = await supabase
      .from("models")
      .insert([modelData])
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      image_urls: data.image_urls || [],
    };
  },

  update: async (id: string, formData: ModelFormData): Promise<Model> => {
    const modelData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      print_time: parseInt(formData.print_time) || 0,
      image_urls: formData.image_urls || [],
    };

    const { data, error } = await supabase
      .from("models")
      .update(modelData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      image_urls: data.image_urls || [],
    };
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
