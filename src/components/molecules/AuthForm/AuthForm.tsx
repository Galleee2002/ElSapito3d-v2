import { useState, FormEvent } from "react";
import { Input, Button, Label, Alert } from "@/components/atoms";
import type { AuthMode } from "@/types";

interface AuthFormProps {
  mode: AuthMode;
  onSubmit: (email: string, password: string) => Promise<void>;
  onModeChange: (mode: AuthMode) => void;
  message: { text: string; type: "success" | "error" | "" };
  onMessageClear: () => void;
}

const AuthForm = ({
  mode,
  onSubmit,
  onModeChange,
  message,
  onMessageClear,
}: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(email, password);
      setEmail("");
      setPassword("");
    } catch (error) {
      // El error se maneja en el componente padre
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeChange = () => {
    onMessageClear();
    setEmail("");
    setPassword("");
    onModeChange(mode === "login" ? "signup" : "login");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert
        message={message.text}
        type={
          message.type === "success"
            ? "success"
            : message.type === "error"
            ? "error"
            : "info"
        }
      />

      <div>
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="password" required>
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={isSubmitting}
        />
        <p className="text-xs text-[var(--color-text)]/50 mt-1">
          Mínimo 6 caracteres
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting
          ? "Procesando..."
          : mode === "login"
          ? "Iniciar Sesión"
          : "Crear Cuenta"}
      </Button>

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={handleModeChange}
          className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium text-sm transition-colors"
        >
          {mode === "login"
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </form>
  );
};

export default AuthForm;
