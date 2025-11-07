import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal, Button, Input } from "@/components";
import { useAuthModal, useAuth } from "@/hooks";
import { cn } from "@/utils";

const AuthModal = () => {
  const { isOpen, mode, closeModal, switchMode } = useAuthModal();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

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
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const success = isRegister
        ? await register(email, password)
        : await login(email, password);

      if (success) {
        closeModal();
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setErrors({});
        navigate("/admin");
      } else {
        setErrors({
          general: "Error al autenticarse. Por favor, intenta nuevamente.",
        });
      }
    } catch (error) {
      setErrors({
        general: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
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
    closeModal();
  };

  if (!mode) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} ariaLabelledBy="auth-modal-title">
      <div className="p-5 sm:p-6 md:p-8 lg:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
            className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-bouncy-lemon)]"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Cerrar modal"
          >
            <X size={24} className="text-[var(--color-contrast-base)]" />
          </motion.button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-[var(--color-toad-eyes)]/10 border-2 border-[var(--color-toad-eyes)]"
            >
              <p className="text-sm text-[var(--color-toad-eyes)] font-semibold">
                {errors.general}
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

          <div className="pt-2 space-y-3">
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

            <div className="text-center">
              <button
                type="button"
                onClick={switchMode}
                className="text-sm text-[var(--color-border-blue)] hover:text-[var(--color-frog-green)] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-bouncy-lemon)] rounded px-2 py-1"
              >
                {isRegister
                  ? "¿Ya tienes cuenta? Inicia sesión"
                  : "¿No tienes cuenta? Crear una"}
              </button>
            </div>
          </div>
        </form>

        {/* Botón volver al inicio */}
        <motion.div
          className="mt-6 pt-6 border-t-2 border-gray-200"
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
              "bg-white border-2 border-[var(--color-border-blue)]",
              "text-[var(--color-contrast-base)] font-semibold",
              "hover:bg-[var(--color-frog-green)] hover:border-[var(--color-frog-green)]",
              "transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-[var(--color-bouncy-lemon)]"
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

