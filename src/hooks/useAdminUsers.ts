import { useCallback, useEffect, useMemo, useState } from "react";
import bcrypt from "bcryptjs";
import { adminCredentialService } from "@/services";
import { AdminCredential } from "@/types";

interface UseAdminUsersResult {
  users: AdminCredential[];
  isLoading: boolean;
  isAdding: boolean;
  error: string | null;
  addUser: (email: string, password: string) => Promise<boolean>;
  toggleAdmin: (email: string) => Promise<void>;
  refresh: () => Promise<void>;
  dismissError: () => void;
  isProcessing: (email: string) => boolean;
}

const sortByEmail = (items: AdminCredential[]): AdminCredential[] => {
  return [...items].sort((first, second) =>
    first.email.localeCompare(second.email)
  );
};

const MIN_PASSWORD_LENGTH = 8;

export const useAdminUsers = (): UseAdminUsersResult => {
  const [users, setUsers] = useState<AdminCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingEmails, setProcessingEmails] = useState<string[]>([]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const credentials = await adminCredentialService.list();
      setUsers(sortByEmail(credentials));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos obtener los usuarios. Intenta nuevamente.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const markEmailAsProcessing = useCallback((email: string) => {
    setProcessingEmails((prevState) => {
      if (prevState.includes(email)) {
        return prevState;
      }
      return [...prevState, email];
    });
  }, []);

  const unmarkEmailAsProcessing = useCallback((email: string) => {
    setProcessingEmails((prevState) =>
      prevState.filter((item) => item !== email)
    );
  }, []);

  const updateUserInState = useCallback((credential: AdminCredential) => {
    setUsers((prevState) => {
      const exists = prevState.some(
        (existing) => existing.email === credential.email
      );

      if (exists) {
        return sortByEmail(
          prevState.map((existing) =>
            existing.email === credential.email ? credential : existing
          )
        );
      }

      return sortByEmail([...prevState, credential]);
    });
  }, []);

  const addUser = useCallback(
    async (rawEmail: string, password: string) => {
      const normalizedEmail = rawEmail.trim().toLowerCase();

      if (!normalizedEmail) {
        setError("Ingresa un correo electrónico válido.");
        return false;
      }

      if (password.length < MIN_PASSWORD_LENGTH) {
        setError(
          `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
        );
        return false;
      }

      setIsAdding(true);
      setError(null);

      try {
        const passwordHash = await bcrypt.hash(password, 10);

        const result = await adminCredentialService.upsert({
          email: normalizedEmail,
          isAdmin: false,
          passwordHash,
        });
        updateUserInState(result);
        return true;
      } catch {
        setError("No pudimos guardar el usuario. Intenta nuevamente.");
        return false;
      } finally {
        setIsAdding(false);
      }
    },
    [updateUserInState]
  );

  const toggleAdmin = useCallback(
    async (email: string) => {
      const credential = users.find((item) => item.email === email);

      if (!credential) {
        setError("No encontramos al usuario seleccionado.");
        return;
      }

      const nextStatus = !credential.isAdmin;

      markEmailAsProcessing(email);
      setError(null);

      try {
        const updated = await adminCredentialService.setAdminStatus(
          email,
          nextStatus
        );
        updateUserInState(updated);
      } catch {
        setError("No pudimos actualizar los permisos. Intenta nuevamente.");
      } finally {
        unmarkEmailAsProcessing(email);
      }
    },
    [
      markEmailAsProcessing,
      unmarkEmailAsProcessing,
      updateUserInState,
      users,
    ]
  );

  const refresh = useCallback(async () => {
    await loadUsers();
  }, [loadUsers]);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  const isProcessing = useCallback(
    (email: string) => processingEmails.includes(email),
    [processingEmails]
  );

  return useMemo(
    () => ({
      users,
      isLoading,
      isAdding,
      error,
      addUser,
      toggleAdmin,
      refresh,
      dismissError,
      isProcessing,
    }),
    [
      users,
      isLoading,
      isAdding,
      error,
      addUser,
      toggleAdmin,
      refresh,
      dismissError,
      isProcessing,
    ]
  );
};


