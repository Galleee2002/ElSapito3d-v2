import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminDashboard } from "@/components/organisms";
import { AuthForm } from "@/components/molecules";
import { useAuth } from "@/hooks";

const AdminDashboardPage = () => {
  const { user, loading, signIn, signOut, message, clearMessage } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      clearMessage();
    }
  }, [user, loading]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoggingIn(true);
    try {
      await signIn(email, password);
    } catch (error) {
      console.error("Error en login:", error);
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

  return <AdminDashboard onLogout={handleLogout} />;
};

export default AdminDashboardPage;

