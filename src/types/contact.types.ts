export interface ContactFormData {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
  archivos: FileList | null;
}

export interface ContactFormErrors {
  nombre?: string;
  email?: string;
  telefono?: string;
  mensaje?: string;
  archivos?: string;
  general?: string;
}

export type FormStatus = "idle" | "loading" | "success" | "error";

