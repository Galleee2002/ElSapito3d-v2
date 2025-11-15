import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal, Button, Input } from "@/components";
import { useAuthModal, useAuth } from "@/hooks";
import { cn } from "@/utils";

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const AuthModal = () => {
  const { isOpen, mode, closeModal, switchMode } = useAuthModal();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "info";
    text: string;
  } | null>(null);

  const isRegister = mode === "register";

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = "El email es requerido";
    } else if (!validateEmail(email)) {
      newErrors.email = "El email no es válido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (isRegister) {
      if (!confirmPassword) {
        newErrors.confirmPassword = "Confirma tu contraseña";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    }

    setErrors(newErrors);
    setStatusMessage(null);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setStatusMessage(null);

    try {
      const response = isRegister
        ? await register(email, password)
        : await login(email, password);

      if (!response.success) {
        setStatusMessage({
          type: "error",
          text:
            response.message ??
            "Error al autenticarse. Por favor, intenta nuevamente.",
        });
        return;
      }

      if (response.requiresEmailVerification) {
        setStatusMessage({
          type: "info",
          text:
            response.message ??
            "Revisa tu correo electrónico para confirmar tu cuenta.",
        });
        return;
      }

      closeModal();
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setErrors({});
      setStatusMessage(null);
      navigate(response.user?.isAdmin ? "/admin" : "/");
    } catch (error) {
      setStatusMessage({
        type: "error",
        text: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
    setStatusMessage(null);
    closeModal();
  };

  if (!mode) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} ariaLabelledBy="auth-modal-title">
      <div className="flex flex-col gap-6 p-5 sm:p-6 md:p-8 lg:p-10">
        <div className="flex items-center justify-between">
          <motion.h2
            id="auth-modal-title"
            className="text-2xl sm:text-3xl font-bold text-[var(--color-contrast-base)]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isRegister ? "Crear cuenta" : "Iniciar sesión"}
          </motion.h2>
          <motion.button
            onClick={handleClose}
            className={cn(
              "p-2 rounded-full hover:bg-gray-100 transition-colors",
              "focus:outline-none"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Cerrar modal"
          >
            <X size={24} className="text-[var(--color-contrast-base)]" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-3 rounded-xl border-2",
                statusMessage.type === "error"
                  ? "bg-[var(--color-toad-eyes)]/10 border-[var(--color-toad-eyes)]"
                  : "bg-[var(--color-border-base)]/10 border-[var(--color-border-base)]"
              )}
            >
              <p
                className={cn(
                  "text-sm font-semibold",
                  statusMessage.type === "error"
                    ? "text-[var(--color-toad-eyes)]"
                    : "text-[var(--color-border-base)]"
                )}
              >
                {statusMessage.text}
              </p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 sm:space-y-5"
            >
              <Input
                id="email"
                type="email"
                label="Email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                error={errors.email}
                required
              />

              <Input
                id="password"
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                error={errors.password}
                required
              />

              {isRegister && (
                <Input
                  id="confirmPassword"
                  type="password"
                  label="Confirmar contraseña"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  error={errors.confirmPassword}
                  required
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="space-y-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting
                ? "Procesando..."
                : isRegister
                ? "Crear cuenta"
                : "Iniciar sesión"}
            </Button>

            <div className="rounded-2xl border-2 border-[var(--color-border-base)] bg-[var(--color-border-base)]/5 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-[var(--color-contrast-base)] sm:text-left text-center font-semibold">
                {isRegister ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatusMessage(null);
                  switchMode();
                }}
                className={cn(
                  "text-sm font-bold text-[var(--color-border-base)] hover:text-[var(--color-frog-green)] transition-colors focus:outline-none"
                )}
              >
                {isRegister ? "Inicia sesión" : "Crear cuenta"}
              </button>
            </div>
          </div>
        </form>

        <motion.div
          className="pt-6 border-t-2 border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            to="/"
            onClick={handleClose}
            className={cn(
              "flex items-center justify-center gap-2",
              "px-4 py-3 rounded-xl",
              "bg-white border-2 border-[var(--color-border-base)]",
              "text-[var(--color-contrast-base)] font-semibold",
              "hover:bg-[var(--color-frog-green)] hover:border-[var(--color-frog-green)]",
              "transition-all duration-300",
              "focus:outline-none"
            )}
          >
            <Home size={20} />
            <span>Volver al inicio</span>
          </Link>
        </motion.div>
      </div>
    </Modal>
  );
};

export default AuthModal;

