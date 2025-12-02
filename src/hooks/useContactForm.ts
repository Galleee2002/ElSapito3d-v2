import { useState, useCallback, ChangeEvent, FormEvent } from "react";
import type {
  ContactFormData,
  ContactFormErrors,
  FormStatus,
} from "../types/contact.types";
import { validateContactForm } from "../utils/validators";

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

      setStatus("loading");
      setErrors({});

      setStatus("success");
      setTimeout(() => {
        resetForm();
      }, 3000);
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

