import { FormEvent, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tag, Plus, RefreshCcw, Edit2, Trash2 } from "lucide-react";
import { Input, Button } from "@/components/atoms";
import { Category } from "@/types";
import { categoriesService } from "@/services";
import { useToast } from "@/hooks/useToast";

const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allCategories = await categoriesService.getAll();
      setCategories(allCategories);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos cargar las categorías. Intenta nuevamente.";
      setError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadCategories();
    const unsubscribe = categoriesService.onCategoriesChanged(loadCategories);
    return unsubscribe;
  }, [loadCategories]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!newCategoryName.trim()) {
      setError("El nombre de la categoría es requerido");
      return;
    }

    setIsAdding(true);
    try {
      await categoriesService.add(newCategoryName.trim());
      setNewCategoryName("");
      showSuccess("Categoría creada exitosamente");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos crear la categoría. Intenta nuevamente.";
      setError(message);
      showError(message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) {
      setError("El nombre de la categoría es requerido");
      return;
    }

    try {
      await categoriesService.update(id, editingName.trim());
      setEditingId(null);
      setEditingName("");
      showSuccess("Categoría actualizada exitosamente");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos actualizar la categoría. Intenta nuevamente.";
      setError(message);
      showError(message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas eliminar la categoría "${name}"? Los productos asociados perderán su categoría.`
      )
    ) {
      return;
    }

    try {
      await categoriesService.delete(id);
      showSuccess("Categoría eliminada exitosamente");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos eliminar la categoría. Intenta nuevamente.";
      setError(message);
      showError(message);
    }
  };

  return (
    <section className="mt-12 sm:mt-14 lg:mt-16 mb-10 sm:mb-12 lg:mb-14">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--color-border-base)]/30 shadow-[0_12px_30px_rgba(71,84,103,0.1)]"
      >
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-3">
            <Tag size={28} className="text-[var(--color-border-base)]" />
            <div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-[var(--color-border-base)]"
                style={{ fontFamily: "var(--font-baloo)" }}
              >
                Gestión de categorías
              </h2>
              <p
                className="text-sm sm:text-base text-[var(--color-contrast-base)]/70"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Organiza tus productos por categorías.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={loadCategories}
            disabled={isLoading}
            className="self-start sm:self-auto bg-[var(--color-frog-green)] border-[var(--color-frog-green)] text-[var(--color-contrast-base)] hover:bg-[var(--color-frog-green)] hover:border-[var(--color-frog-green)] hover:text-[var(--color-contrast-base)] hover:shadow-[0_10px_25px_rgba(43,43,43,0.12)]"
          >
            <RefreshCcw size={18} className="mr-2" />
            Actualizar
          </Button>
        </header>

        <motion.form onSubmit={handleSubmit} className="grid gap-4 mb-8">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <Input
              id="new-category-name"
              label="Nombre de la categoría"
              value={newCategoryName}
              placeholder="Ej: Decoración, Juguetes, Herramientas"
              onChange={(event) => setNewCategoryName(event.target.value)}
              required
            />
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={isAdding}
                className="w-full sm:w-auto"
              >
                <Plus size={18} className="mr-2" />
                {isAdding ? "Guardando..." : "Agregar"}
              </Button>
            </div>
          </div>
        </motion.form>

        {error && (
          <div
            className="mb-6 rounded-2xl border-2 border-[var(--color-toad-eyes)] bg-[var(--color-toad-eyes)]/10 px-4 py-3"
            role="alert"
          >
            <div className="flex items-center justify-between gap-4">
              <p
                className="text-sm sm:text-base text-[var(--color-toad-eyes)] font-semibold"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                {error}
              </p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-sm text-[var(--color-toad-eyes)] underline"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="py-10 text-center">
            <p className="text-base text-[var(--color-border-base)]">
              Cargando categorías...
            </p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-[var(--color-border-base)]/30 rounded-2xl">
            <p className="text-base sm:text-lg text-[var(--color-border-base)]/70">
              Aún no has creado categorías.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-xl "
              >
                {editingId === category.id ? (
                  <>
                    <Input
                      id={`edit-category-${category.id}`}
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      className="flex-1"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleSaveEdit(category.id)}
                        className="flex-1 sm:flex-none"
                      >
                        Guardar
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleCancelEdit}
                        className="flex-1 sm:flex-none"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <h3
                        className="text-lg font-semibold text-[var(--color-border-base)]"
                        style={{ fontFamily: "var(--font-baloo)" }}
                      >
                        {category.name}
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(category)}
                        className="flex-1 sm:flex-none"
                      >
                        <Edit2 size={16} className="mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleDelete(category.id, category.name)}
                        className="flex-1 sm:flex-none bg-[var(--color-toad-eyes)] border-[var(--color-toad-eyes)] text-white hover:bg-[var(--color-toad-eyes)]/90"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default CategoryManager;
