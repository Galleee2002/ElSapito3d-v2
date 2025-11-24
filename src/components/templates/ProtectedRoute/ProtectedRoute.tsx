import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks";
import { navigateTo, NAVIGATION_PATHS } from "@/utils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const [showEmergencyButton, setShowEmergencyButton] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowEmergencyButton(true);
      }, 8000);
      
      return () => clearTimeout(timer);
    } else {
      setShowEmergencyButton(false);
    }
  }, [isLoading]);

  const handleEmergencyLogout = async () => {
    await logout();
    localStorage.clear();
    navigateTo(NAVIGATION_PATHS.HOME);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5FAFF] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-border-base)] border-t-transparent mb-4"></div>
          <p className="text-lg text-[var(--color-border-base)] font-semibold mb-6">
            Verificando acceso...
          </p>
          {showEmergencyButton && (
            <button
              onClick={handleEmergencyLogout}
              className="px-6 py-3 bg-[var(--color-toad-eyes)] text-white rounded-xl font-semibold hover:bg-[var(--color-toad-eyes)]/90 transition-colors"
            >
              Forzar cierre de sesión
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
