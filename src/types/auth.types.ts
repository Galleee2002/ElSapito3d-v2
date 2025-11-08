export interface AuthUser {
  email: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser | null;
  message?: string;
  requiresEmailVerification?: boolean;
}

