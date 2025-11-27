import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useColors } from "./useColors";
import type { Color } from "@/types";

interface ColorStoreContextValue {
  colors: Color[];
  loading: boolean;
  error: string | null;
  refreshColors: () => Promise<void>;
  addColor: (name: string, hex: string) => Promise<void>;
  toggleColorStock: (id: string) => Promise<void>;
  setColorStock: (id: string, inStock: boolean) => Promise<void>;
  deleteColor: (id: string) => Promise<void>;
}

const ColorStoreContext = createContext<ColorStoreContextValue | undefined>(
  undefined
);

interface ColorStoreProviderProps {
  children: ReactNode;
}

export const ColorStoreProvider = ({ children }: ColorStoreProviderProps) => {
  const {
    colors: dbColors,
    loading,
    error,
    refreshColors,
    addColor,
    toggleColorStatus,
    setColorStatus,
    deleteColor,
  } = useColors();

  const mappedColors = useMemo<Color[]>(
    () =>
      dbColors.map((color) => ({
        id: color.id,
        name: color.name,
        hex: color.code,
        inStock: color.is_active,
      })),
    [dbColors]
  );

  const value = useMemo<ColorStoreContextValue>(
    () => ({
      colors: mappedColors,
      loading,
      error,
      refreshColors,
      addColor: async (name: string, hex: string) => {
        await addColor(name, hex);
      },
      toggleColorStock: async (id: string) => {
        const target = dbColors.find((color) => color.id === id);
        await toggleColorStatus(id, target?.is_active ?? true);
      },
      setColorStock: async (id: string, inStock: boolean) => {
        await setColorStatus(id, inStock);
      },
      deleteColor: async (id: string) => {
        await deleteColor(id);
      },
    }),
    [
      mappedColors,
      loading,
      error,
      refreshColors,
      addColor,
      dbColors,
      toggleColorStatus,
      setColorStatus,
      deleteColor,
    ]
  );

  return (
    <ColorStoreContext.Provider value={value}>
      {children}
    </ColorStoreContext.Provider>
  );
};

export const useColorStore = (): ColorStoreContextValue => {
  const context = useContext(ColorStoreContext);

  if (!context) {
    throw new Error("useColorStore debe utilizarse dentro de ColorStoreProvider");
  }

  return context;
};







