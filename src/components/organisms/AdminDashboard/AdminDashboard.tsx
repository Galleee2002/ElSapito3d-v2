import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, Home } from "lucide-react";
import { Button, Alert } from "@/components/atoms";
import { ModelForm, ModelCard } from "@/components/molecules";
import { modelsService } from "@/services";
import { useAuth } from "@/hooks";
import { cn } from "@/utils";
import type { Model, ModelFormData } from "@/types";

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingModel, setEditingModel] = useState<Model | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      loadModels();
    }
  }, [user]);

  const loadModels = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await modelsService.getAll();
      setModels(data);
    } catch (err) {
      console.error("Error al cargar modelos:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al cargar los modelos. Verifica las políticas RLS en Supabase.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: ModelFormData) => {
    if (!user) return;

    try {
      setError("");
      if (editingModel) {
        await modelsService.update(editingModel.id, formData);
      } else {
        await modelsService.create(formData, user.id);
      }
      setShowForm(false);
      setEditingModel(undefined);
      await loadModels();
    } catch (err) {
      throw err;
    }
  };

  const handleEdit = (model: Model) => {
    setEditingModel(model);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este modelo?")) return;

    try {
      setError("");
      await modelsService.delete(id);
      await loadModels();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar el modelo"
      );
    }
  };

  const handleTogglePublic = async (model: Model) => {
    try {
      setError("");
      await modelsService.togglePublic(model.id, model.is_public);
      await loadModels();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cambiar la visibilidad del modelo"
      );
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingModel(undefined);
    setError("");
  };

  const handleNewModel = () => {
    setEditingModel(undefined);
    setShowForm(true);
    setError("");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center">
        <div className="text-[var(--color-text)]/70">Cargando usuario...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <nav className="bg-white shadow-sm border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Panel de Admin
          </h1>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto flex-wrap">
            <Button
              onClick={() => navigate("/")}
              variant="accent"
              size="sm"
              className="bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
            >
              <span className="flex items-center gap-2">
                <Home size={16} />
                <span className="hidden sm:inline">Inicio</span>
              </span>
            </Button>
            <span className="text-sm text-[var(--color-text)]/70 flex-1 sm:flex-none">
              {user.email}
            </span>
            <Button
              onClick={onLogout}
              variant="accent"
              size="sm"
              className="bg-red-50 hover:bg-red-100 text-red-700"
            >
              <span className="flex items-center gap-2">
                <LogOut size={16} />
                Salir
              </span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            Mis Modelos ({models.length})
          </h2>
          <Button
            onClick={handleNewModel}
            variant="primary"
            size="md"
            disabled={showForm}
          >
            <span className="flex items-center gap-2">
              <Plus size={20} />
              Nuevo Modelo
            </span>
          </Button>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            className="mb-6"
          />
        )}

        {showForm && (
          <ModelForm
            model={editingModel}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            userId={user.id}
          />
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-[var(--color-text)]/50">Cargando...</div>
          </div>
        ) : models.length === 0 && !showForm ? (
          <div className="text-center py-12">
            <p className="text-[var(--color-text)]/70 mb-4">
              No tienes modelos aún
            </p>
            <Button onClick={handleNewModel} variant="primary" size="md">
              Crear tu primer modelo
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
              showForm && "opacity-50 pointer-events-none"
            )}
          >
            {models.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePublic={handleTogglePublic}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

