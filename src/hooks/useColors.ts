import { useState, useEffect, useCallback } from "react";
import { colorsService } from "@/services/colors.service";
import { DBColor } from "@/types/color.types";
import { toast } from "react-hot-toast";

export const useColors = () => {
  const [colors, setColors] = useState<DBColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchColors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await colorsService.getAllOrSeedDefaults();
      setColors(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error al cargar los colores");
    } finally {
      setLoading(false);
    }
  }, []);

  const setColorStatus = async (id: string, isActive: boolean) => {
    try {
      await colorsService.updateStatus(id, isActive);
      toast.success(`Color ${isActive ? "habilitado" : "marcado sin stock"}`);
      fetchColors();
    } catch (err) {
      toast.error("Error al actualizar el estado del color");
      throw err;
    }
  };

  const addColor = async (name: string, code: string) => {
    try {
      await colorsService.create({ name, code });
      toast.success("Color agregado correctamente");
      fetchColors();
    } catch (err) {
      toast.error("Error al agregar el color");
      throw err;
    }
  };

  const toggleColorStatus = async (id: string, currentStatus: boolean) => {
    await setColorStatus(id, !currentStatus);
  };

  const deleteColor = async (id: string) => {
    try {
      await colorsService.delete(id);
      toast.success("Color eliminado correctamente");
      fetchColors();
    } catch (err) {
      toast.error("Error al eliminar el color");
      throw err;
    }
  };

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  return {
    colors,
    loading,
    error,
    refreshColors: fetchColors,
    setColorStatus,
    addColor,
    toggleColorStatus,
    deleteColor,
  };
};

