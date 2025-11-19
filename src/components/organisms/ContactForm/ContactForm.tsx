import { useContactForm } from "../../../hooks/useContactForm";

const ContactForm = () => {
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

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Formulario de Contacto
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Nombre */}
          <div>
            <label
              htmlFor="contact-form-nombre"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.nombre
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 bg-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Ingresa tu nombre completo"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          {/* Campo Email */}
          <div>
            <label
              htmlFor="contact-form-email"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.email
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 bg-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Campo Teléfono */}
          <div>
            <label
              htmlFor="contact-form-telefono"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.telefono
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 bg-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="+54 9 11 1234-5678"
            />
            {errors.telefono && (
              <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
            )}
          </div>

          {/* Campo Archivos */}
          <div>
            <label
              htmlFor="contact-form-archivos"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Adjuntar archivos <span className="text-gray-500">(opcional)</span>
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

          {/* Campo Mensaje */}
          <div>
            <label
              htmlFor="contact-form-mensaje"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                errors.mensaje
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 bg-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Describe tu consulta o mensaje..."
            />
            {errors.mensaje && (
              <p className="mt-1 text-sm text-red-600">{errors.mensaje}</p>
            )}
          </div>

          {/* Error General */}
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">
                {errors.general}
              </p>
            </div>
          )}

          {/* Mensaje de Éxito */}
          {isSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600 text-center font-medium">
                ¡Mensaje enviado con éxito! Te contactaremos pronto.
              </p>
            </div>
          )}

          {/* Botón de Envío */}
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
              isLoading || isSuccess
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
            } focus:outline-none focus:ring-4 focus:ring-blue-300`}
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
      </div>
    </div>
  );
};

export default ContactForm;

