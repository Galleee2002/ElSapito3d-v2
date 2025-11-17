import type { ContactFormData, ContactFormErrors } from "../types/contact.types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\s/g, "");
  return PHONE_REGEX.test(cleanPhone) && cleanPhone.length >= 8;
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateContactForm = (
  data: ContactFormData
): ContactFormErrors => {
  const errors: ContactFormErrors = {};

  if (!validateRequired(data.nombre)) {
    errors.nombre = "El nombre es obligatorio";
  } else if (data.nombre.trim().length < 2) {
    errors.nombre = "El nombre debe tener al menos 2 caracteres";
  }

  if (!validateRequired(data.email)) {
    errors.email = "El correo electrónico es obligatorio";
  } else if (!validateEmail(data.email)) {
    errors.email = "El correo electrónico no es válido";
  }

  if (!validateRequired(data.telefono)) {
    errors.telefono = "El número de teléfono es obligatorio";
  } else if (!validatePhone(data.telefono)) {
    errors.telefono = "El número de teléfono no es válido";
  }

  if (!validateRequired(data.mensaje)) {
    errors.mensaje = "El mensaje es obligatorio";
  } else if (data.mensaje.trim().length < 10) {
    errors.mensaje = "El mensaje debe tener al menos 10 caracteres";
  }

  return errors;
};

