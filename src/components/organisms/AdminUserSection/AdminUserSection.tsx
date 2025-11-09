import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, RefreshCcw } from "lucide-react";
import { Input, Button } from "@/components/atoms";
import AdminUserRow from "@/components/molecules/AdminUserRow";
import { useAdminUsers } from "@/hooks";

const AdminUserSection = () => {
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserPasswordConfirm, setNewUserPasswordConfirm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const {
    users,
    isLoading,
    isAdding,
    error,
    addUser,
    toggleAdmin,
    refresh,
    dismissError,
    isProcessing,
  } = useAdminUsers();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (newUserPassword !== newUserPasswordConfirm) {
      setFormError("Las contraseñas no coinciden.");
      return;
    }

    const wasCreated = await addUser(newUserEmail, newUserPassword);
    if (wasCreated) {
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserPasswordConfirm("");
    }
  };

  const handleRefresh = () => {
    void refresh();
  };

  return (
    <section className="mt-12 sm:mt-14 lg:mt-16 mb-10 sm:mb-12 lg:mb-14">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[var(--color-border-blue)]/30 shadow-[0_12px_30px_rgba(39,76,154,0.1)]"
      >
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users size={28} className="text-[var(--color-border-blue)]" />
            <div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-[var(--color-border-blue)]"
                style={{ fontFamily: "var(--font-baloo)" }}
              >
                Gestión de usuarios
              </h2>
              <p
                className="text-sm sm:text-base text-[var(--color-contrast-base)]/70"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                Controla quién tiene permisos de administrador.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={isLoading}
            className="self-start sm:self-auto hover:bg-[var(--color-frog-green)] hover:border-[var(--color-frog-green)] hover:text-[var(--color-contrast-base)]"
          >
            <RefreshCcw size={18} className="mr-2" />
            Actualizar
          </Button>
        </header>

        <motion.form
          onSubmit={handleSubmit}
          className="grid gap-4 mb-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="new-admin-email"
              label="Correo electrónico"
              type="email"
              value={newUserEmail}
              placeholder="usuario@ejemplo.com"
              onChange={(event) => setNewUserEmail(event.target.value)}
              required
              className="sm:col-span-2"
            />
            <Input
              id="new-admin-password"
              label="Contraseña temporal"
              type="password"
              value={newUserPassword}
              placeholder="Mínimo 8 caracteres"
              onChange={(event) => setNewUserPassword(event.target.value)}
              required
            />
            <Input
              id="new-admin-password-confirm"
              label="Confirmar contraseña"
              type="password"
              value={newUserPasswordConfirm}
              placeholder="Repite la contraseña"
              onChange={(event) =>
                setNewUserPasswordConfirm(event.target.value)
              }
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isAdding}
            className="sm:justify-self-start"
          >
            <UserPlus size={18} className="mr-2" />
            {isAdding ? "Guardando..." : "Registrar usuario"}
          </Button>
        </motion.form>

        {(formError || error) && (
          <div
            className="mb-6 rounded-2xl border-2 border-[var(--color-toad-eyes)] bg-[var(--color-toad-eyes)]/10 px-4 py-3"
            role="alert"
          >
            <div className="flex items-center justify-between gap-4">
              <p
                className="text-sm sm:text-base text-[var(--color-toad-eyes)] font-semibold"
                style={{ fontFamily: "var(--font-nunito)" }}
              >
                {formError ?? error}
              </p>
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  dismissError();
                }}
                className="text-sm text-[var(--color-toad-eyes)] underline"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="py-10 text-center">
            <p className="text-base text-[var(--color-border-blue)]">
              Cargando usuarios...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-[var(--color-border-blue)] rounded-2xl">
            <p className="text-base sm:text-lg text-[var(--color-border-blue)]/70">
              Aún no registras usuarios adicionales.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((credential) => (
              <AdminUserRow
                key={credential.email}
                credential={credential}
                onToggleRole={toggleAdmin}
                isProcessing={isProcessing(credential.email)}
              />
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default AdminUserSection;


