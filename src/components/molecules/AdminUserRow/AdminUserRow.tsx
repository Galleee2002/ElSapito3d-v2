import { Button } from "@/components/atoms";
import { AdminCredential } from "@/types";
import { cn } from "@/utils";

interface AdminUserRowProps {
  credential: AdminCredential;
  onToggleRole: (email: string) => void;
  isProcessing: boolean;
}

export const AdminUserRow = ({
  credential,
  onToggleRole,
  isProcessing,
}: AdminUserRowProps) => {
  const { email, isAdmin } = credential;

  const statusLabel = isAdmin ? "Administrador" : "Colaborador";

  const statusClasses = cn(
    "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold",
    "border-2 transition-colors duration-200",
    isAdmin
      ? "bg-[var(--color-border-blue)]/10 border-[var(--color-border-blue)] text-[var(--color-border-blue)]"
      : "bg-white border-[var(--color-toad-eyes)] text-[var(--color-toad-eyes)]"
  );

  const actionLabel = isAdmin ? "Revocar acceso" : "Conceder acceso";

  const handleToggleClick = () => {
    onToggleRole(email);
  };

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-2xl border-2 border-[var(--color-border-blue)]/40"
      role="group"
      aria-label={`Usuario ${email}`}
    >
      <div>
        <p
          className="text-base sm:text-lg font-semibold text-[var(--color-contrast-base)]"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          {email}
        </p>
        <span className="mt-2 inline-block">
          <span className={statusClasses}>{statusLabel}</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant={isAdmin ? "secondary" : "primary"}
          onClick={handleToggleClick}
          disabled={isProcessing}
          className={cn(
            "px-5 py-2 text-sm sm:text-base",
            isAdmin
              ? "hover:bg-[var(--color-toad-eyes)] hover:border-[var(--color-toad-eyes)] hover:text-white"
              : undefined
          )}
        >
          {isProcessing ? "Guardando..." : actionLabel}
        </Button>
      </div>
    </div>
  );
};


