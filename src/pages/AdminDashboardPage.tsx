import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminDashboard } from "@/components/organisms";
import { AuthForm, Alert } from "@/components";
import { useAuth } from "@/hooks";
import { isAdmin } from "@/utils";

const AdminDashboardPage = () => {
  const { user, loading, signIn, signOut, message, clearMessage } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading && !isAdmin(user)) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && !loading && message.text) {
      clearMessage();
    }
  }, [user, loading, message.text, clearMessage]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoggingIn(true);
    try {
      await signIn(email, password);
    } catch (error) {
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin");
  };

  if (loading || isLoggingIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 flex items-center justify-center p-4">
        <div className="text-[var(--color-text)]/70">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-6 text-center">
            Admin Login
          </h1>
          <AuthForm
            mode="login"
            onSubmit={handleLogin}
            onModeChange={() => {}}
            message={message}
            onMessageClear={clearMessage}
          />
        </div>
      </div>
    );
  }

  if (!isAdmin(user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <Alert message="No tienes permisos de administrador" type="error" />
          <button
            onClick={() => navigate("/")}
            className="mt-4 w-full px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
};

export default AdminDashboardPage;
