import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Palette, Plus, RefreshCcw, Trash2, Check, X } from "lucide-react";
import { Input, Button } from "@/components/atoms";
import { useColorStore } from "@/hooks";

const ColorManager = () => {
  const {
    colors,
    loading,
    error,
    refreshColors,
    addColor,
    toggleColorStock,
    deleteColor,
  } = useColorStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorCode, setNewColorCode] = useState("#000000");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newColorName.trim() || !newColorCode.trim()) return;

    setIsAdding(true);
    try {
      await addColor(newColorName.trim(), newColorCode.trim());
      setNewColorName("");
      setNewColorCode("#000000");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el color "${name}"?`)) {
      await deleteColor(id);
    }
  };

  return (
    <section className="mb-10 sm:mb-12 lg:mb-14">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--color-border-base)]/30 shadow-[0_12px_30px_rgba(71,84,103,0.1)]"
      >
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-3">
            <Palette size={28} className="text-[var(--color-border-base)]" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-border-base)] font-baloo">
                Gestión de Colores
              </h2>
              <p
                className="text-sm sm:text-base text-[var(--color-contrast-base)]/70"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Administra la disponibilidad de colores para los productos.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={refreshColors}
            disabled={loading}
            className="self-start sm:self-auto bg-[var(--color-frog-green)] border-[var(--color-frog-green)] text-[var(--color-contrast-base)] hover:bg-[var(--color-frog-green)] hover:border-[var(--color-frog-green)] hover:text-[var(--color-contrast-base)] hover:shadow-[0_10px_25px_rgba(43,43,43,0.12)]"
          >
            <RefreshCcw size={18} className="mr-2" />
            Actualizar
          </Button>
        </header>

        <motion.form onSubmit={handleSubmit} className="grid gap-4 mb-8">
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr_auto]">
            <Input
              id="new-color-name"
              label="Nombre del color"
              value={newColorName}
              placeholder="Ej: Rojo Pasión"
              onChange={(event) => setNewColorName(event.target.value)}
              required
            />
            <div className="flex flex-col gap-2">
              <label htmlFor="new-color-code" className="text-sm font-semibold text-[var(--color-border-base)] font-poppins ml-1">
                Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="new-color-code"
                  value={newColorCode}
                  onChange={(e) => setNewColorCode(e.target.value)}
                  className="h-[42px] w-[50px] rounded cursor-pointer border border-gray-300 p-1"
                />
                <Input
                  id="new-color-hex"
                  value={newColorCode}
                  onChange={(e) => setNewColorCode(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={isAdding}
                className="w-full sm:w-auto hover:bg-[var(--color-bouncy-lemon)] hover:border-[var(--color-bouncy-lemon)]"
              >
                <Plus size={18} className="mr-2" />
                {isAdding ? "Guardando..." : "Agregar"}
              </Button>
            </div>
          </div>
        </motion.form>

        {error && (
          <div className="mb-6 rounded-2xl border-2 border-[var(--color-toad-eyes)] bg-[var(--color-toad-eyes)]/10 px-4 py-3" role="alert">
            <p className="text-sm sm:text-base text-[var(--color-toad-eyes)] font-semibold">
              {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="py-10 text-center">
            <p className="text-base text-[var(--color-border-base)]">Cargando colores...</p>
          </div>
        ) : colors.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-[var(--color-border-base)]/30 rounded-2xl">
            <p className="text-base sm:text-lg text-[var(--color-border-base)]/70">
              No hay colores registrados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {colors.map((color) => (
              <motion.div
                key={color.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  color.inStock
                    ? "border-[var(--color-border-base)]/20 bg-white"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <h3
                      className={`text-base font-semibold ${
                        color.inStock
                          ? "text-[var(--color-border-base)]"
                          : "text-red-800 line-through"
                      }`}
                    >
                      {color.name}
                    </h3>
                    <p className="text-xs text-gray-500 uppercase">
                      {color.hex}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <button
                    onClick={() => void toggleColorStock(color.id)}
                    className={`p-2 rounded-full transition-colors ${
                      color.inStock
                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                    }`}
                    title={
                      color.inStock
                        ? "Marcar como sin stock"
                        : "Marcar como disponible"
                    }
                  >
                    {color.inStock ? <Check size={16} /> : <X size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(color.id, color.name)}
                    className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Eliminar color"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default ColorManager;

