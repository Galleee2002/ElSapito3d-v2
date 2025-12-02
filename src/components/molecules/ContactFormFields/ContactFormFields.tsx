import { useContactForm } from "@/hooks/useContactForm";
import { CONTACT_PHONE } from "@/constants";

interface ContactFormFieldsProps {
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  buttonClassName?: string;
  showTitle?: boolean;
  title?: string;
}

const ContactFormFields = ({
  className = "",
  inputClassName = "",
  labelClassName = "",
  buttonClassName = "",
  showTitle = false,
  title = "Formulario de Contacto",
}: ContactFormFieldsProps) => {
  const {
    formData,
    errors,
    status,
    handleChange,
    handleFileChange,
    handleSubmit,
  } = useContactForm();

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  const baseInputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${inputClassName}`;
  const errorInputClasses = "border-red-500 bg-red-50";
  const normalInputClasses = "border-gray-300 bg-white";

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {showTitle && (
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {title}
        </h2>
      )}

      <div>
        <label
          htmlFor="contact-form-nombre"
          className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}
        >
          Nombre completo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="contact-form-nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          disabled={isLoading}
          className={`${baseInputClasses} ${
            errors.nombre ? errorInputClasses : normalInputClasses
          }`}
          placeholder="Ingresa tu nombre completo"
        />
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-form-email"
          className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}
        >
          Correo electrónico <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="contact-form-email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          className={`${baseInputClasses} ${
            errors.email ? errorInputClasses : normalInputClasses
          }`}
          placeholder="tu@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-form-telefono"
          className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}
        >
          Número de teléfono <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="contact-form-telefono"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          disabled={isLoading}
          className={`${baseInputClasses} ${
            errors.telefono ? errorInputClasses : normalInputClasses
          }`}
          placeholder={CONTACT_PHONE}
        />
        {errors.telefono && (
          <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-form-archivos"
          className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}
        >
          Adjuntar archivos{" "}
          <span className="text-gray-500">(opcional)</span>
        </label>
        <input
          type="file"
          id="contact-form-archivos"
          name="archivos"
          onChange={handleFileChange}
          disabled={isLoading}
          multiple
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {formData.archivos && formData.archivos.length > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            {formData.archivos.length} archivo(s) seleccionado(s)
          </p>
        )}
        {errors.archivos && (
          <p className="mt-1 text-sm text-red-600">{errors.archivos}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-form-mensaje"
          className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}
        >
          Mensaje / Inquietud <span className="text-red-500">*</span>
        </label>
        <textarea
          id="contact-form-mensaje"
          name="mensaje"
          value={formData.mensaje}
          onChange={handleChange}
          disabled={isLoading}
          rows={6}
          className={`${baseInputClasses} resize-none ${
            errors.mensaje ? errorInputClasses : normalInputClasses
          }`}
          placeholder="Describe tu consulta o mensaje..."
        />
        {errors.mensaje && (
          <p className="mt-1 text-sm text-red-600">{errors.mensaje}</p>
        )}
      </div>

      {errors.general && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 text-center">{errors.general}</p>
        </div>
      )}

      {isSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600 text-center font-medium">
            ¡Formulario enviado con éxito!
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || isSuccess}
        className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 ${
          isLoading || isSuccess
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-bouncy-lemon hover:scale-105 active:scale-[0.98] text-gray-900"
        } focus:outline-none focus:ring-4 focus:ring-yellow-300 ${buttonClassName}`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Enviando...
          </span>
        ) : isSuccess ? (
          "¡Enviado!"
        ) : (
          "Enviar mensaje"
        )}
      </button>

      <p className="text-sm text-gray-500 text-center">
        Los campos marcados con <span className="text-red-500">*</span> son
        obligatorios
      </p>
    </form>
  );
};

export default ContactFormFields;

