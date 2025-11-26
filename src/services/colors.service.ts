import { supabase } from "./supabase";
import { DBColor } from "@/types/color.types";
import { PREDEFINED_COLORS } from "@/constants";

const TABLE_NAME = "colors";

export const colorsService = {
  async getAll(): Promise<DBColor[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching colors:", error);
      throw error;
    }

    return data || [];
  },

  async getAllOrSeedDefaults(): Promise<DBColor[]> {
    const existingColors = await this.getAll();

    if (existingColors.length > 0) {
      return existingColors;
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(
        PREDEFINED_COLORS.map((color) => ({
          name: color.name,
          code: color.code,
          is_active: true,
        }))
      )
      .select();

    if (error) {
      console.error("Error seeding default colors:", error);
      throw error;
    }

    return data || [];
  },

  async create(color: Omit<DBColor, "id" | "created_at" | "is_active">): Promise<DBColor> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{ ...color, is_active: true }])
      .select()
      .single();

    if (error) {
      console.error("Error creating color:", error);
      throw error;
    }

    return data;
  },

  async updateStatus(id: string, is_active: boolean): Promise<DBColor> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ is_active })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating color status:", error);
      throw error;
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting color:", error);
      throw error;
    }
  },
};

