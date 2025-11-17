import { useState, useCallback, ChangeEvent, FormEvent } from "react";
import emailjs from "@emailjs/browser";
import type {
  ContactFormData,
  ContactFormErrors,
  FormStatus,
} from "../types/contact.types";
import { validateContactForm } from "../utils/validators";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

interface UseContactFormReturn {
  formData: ContactFormData;
  errors: ContactFormErrors;
  status: FormStatus;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  resetForm: () => void;
}

const initialFormData: ContactFormData = {
  nombre: "",
  email: "",
  telefono: "",
  mensaje: "",
  archivos: null,
};

export const useContactForm = (): UseContactFormReturn => {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      if (errors[name as keyof ContactFormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setFormData((prev) => ({ ...prev, archivos: files }));
    
    if (errors.archivos) {
      setErrors((prev) => ({ ...prev, archivos: undefined }));
    }
  }, [errors.archivos]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setStatus("idle");
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      const validationErrors = validateContactForm(formData);
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        setErrors({
          general:
            "Error de configuración. Contacte al administrador del sitio.",
        });
        setStatus("error");
        return;
      }

      setStatus("loading");
      setErrors({});

      try {
        const templateParams: Record<string, unknown> = {
          from_name: formData.nombre,
          from_email: formData.email,
          phone: formData.telefono,
          message: formData.mensaje,
        };

        if (formData.archivos && formData.archivos.length > 0) {
          const filePromises = Array.from(formData.archivos).map(
            (file) =>
              new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              })
          );

          const fileContents = await Promise.all(filePromises);
          
          templateParams.attachments = Array.from(formData.archivos).map(
            (file, index) => ({
              name: file.name,
              data: fileContents[index],
            })
          );
        }

        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);

        setStatus("success");
        setTimeout(() => {
          resetForm();
        }, 3000);
      } catch (error) {
        console.error("Error al enviar el formulario:", error);
        setErrors({
          general:
            "Hubo un error al enviar el mensaje. Por favor, intente nuevamente.",
        });
        setStatus("error");
      }
    },
    [formData, resetForm]
  );

  return {
    formData,
    errors,
    status,
    handleChange,
    handleFileChange,
    handleSubmit,
    resetForm,
  };
};

