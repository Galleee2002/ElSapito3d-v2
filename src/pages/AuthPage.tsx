import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, LogOut, Home } from "lucide-react";
import { useAuth } from "@/hooks";
import { AuthForm, Alert, Button } from "@/components";
import type { AuthMode } from "@/types";
import logoImage from "@/assets/images/logo.webp";

const AuthPage = () => {
  const { user, loading, signUp, signIn, signOut, message, clearMessage } =
    useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get("mode") === "signup" ? "signup" : "login") as AuthMode;
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setAuthMode("signup");
    } else if (mode === "login") {
      setAuthMode("login");
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center">
        <div className="text-xl text-white/80">Cargando...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center p-4">
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-[var(--color-primary)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
              Sesión Activa
            </h2>
            <p className="text-[var(--color-text)]/60">Bienvenido de vuelta</p>
          </div>

          <div className="bg-[var(--color-surface)] border border-black/10 rounded-[var(--radius-md)] p-4 mb-6">
            <p className="text-sm text-[var(--color-text)]/50 mb-1">Email:</p>
            <p className="text-[var(--color-text)] font-medium break-all">
              {user.email}
            </p>
            <p className="text-sm text-[var(--color-text)]/50 mt-3 mb-1">
              ID:
            </p>
            <p className="text-xs text-[var(--color-text)]/60 font-mono break-all">
              {user.id}
            </p>
          </div>

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

          <div className="flex flex-col gap-3">
            <Button
              onClick={signOut}
              variant="primary"
              size="lg"
              className="w-full"
            >
              <span className="relative z-10 flex items-center justify-center">
                <LogOut size={18} className="mr-2" />
                Cerrar Sesión
              </span>
            </Button>
            <Link
              to="/"
              className="text-center text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium text-sm transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAuth = async (email: string, password: string) => {
    try {
      setErrorMessage("");
      if (authMode === "signup") {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      const authError = error as { message: string };
      setErrorMessage(authError.message);
    }
  };

  const currentMessage = errorMessage
    ? { text: errorMessage, type: "error" as const }
    : message;

  return (
    <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-8 w-full max-w-md">
        <div className="flex justify-between items-start mb-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center group"
          >
            <img
              src={logoImage}
              alt="Logo ElSapito3D"
              className="w-12 h-12 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </Link>
          <Button
            onClick={() => navigate("/")}
            variant="primary"
            size="sm"
            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 border-[var(--color-primary)]"
          >
            <span className="flex items-center gap-2">
              <Home size={16} />
              Inicio
            </span>
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
            {authMode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </h1>
          <p className="text-[var(--color-text)]/60">
            {authMode === "login"
              ? "Accede a tu cuenta"
              : "Regístrate para comenzar"}
          </p>
        </div>

        <AuthForm
          mode={authMode}
          onSubmit={handleAuth}
          onModeChange={setAuthMode}
          message={currentMessage}
          onMessageClear={() => {
            clearMessage();
            setErrorMessage("");
          }}
        />
      </div>
    </div>
  );
};

export default AuthPage;

