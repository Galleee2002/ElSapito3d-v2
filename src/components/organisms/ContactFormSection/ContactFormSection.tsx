import { useContactForm } from "../../../hooks/useContactForm";

const ContactFormSection = () => {
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
    <section id="contacto" className="py-16 md:py-24 bg-frog-green">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de la Sección */}
        <div className="text-center mb-12 md:mb-16 text-white">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "var(--font-baloo)" }}
          >
            ¡Hablemos de tu Proyecto!
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            ¿Tienes una idea? Cuéntanos y la hacemos realidad
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Columna Izquierda: Información */}
          <div className="space-y-8">
            {/* Info Cards */}
            <div className="space-y-4">
              {/* Email Card */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-border-base/15">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-frog-green/15 border border-frog-green/40">
                    <svg
                      className="w-6 h-6 text-frog-green"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-contrast-base mb-1">
                      Email
                    </h3>
                    <a
                      href="mailto:hola@elsapito3d.com"
                      className="text-toad-eyes hover:opacity-80 transition-opacity"
                    >
                      hola@elsapito3d.com
                    </a>
                  </div>
                </div>
              </div>

              {/* WhatsApp Card */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-border-base/15">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-frog-green/15 border border-frog-green/40">
                    <svg
                      className="w-6 h-6 text-frog-green"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-contrast-base mb-1">
                      WhatsApp
                    </h3>
                    <a
                      href="https://wa.me/541112345678"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-toad-eyes hover:opacity-80 transition-opacity"
                    >
                      +54 11 1234-5678
                    </a>
                  </div>
                </div>
              </div>

              {/* Horario Card */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-border-base/15">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-bouncy-lemon/25 border border-bouncy-lemon/50">
                    <svg
                      className="w-6 h-6 text-contrast-base"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-contrast-base mb-1">
                      Horario de Atención
                    </h3>
                    <p className="text-border-base">Lun - Vie: 9:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Beneficios */}
            <div className="bg-contrast-base p-8 rounded-xl shadow-lg text-white">
              <h3 className="text-2xl font-bold mb-4">¿Por qué elegirnos?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Respuesta en menos de 24 horas</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Asesoramiento personalizado</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Calidad garantizada en cada proyecto</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Columna Derecha: Formulario */}
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 border border-border-base/10">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo Nombre */}
              <div>
                <label
                  htmlFor="nombre"
                  className="block text-sm font-semibold text-contrast-base mb-2"
                >
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-frog-green/50 focus:border-transparent transition-colors ${
                    errors.nombre
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="Tu nombre"
                />
                {errors.nombre && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>

              {/* Campo Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-contrast-base mb-2"
                >
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-frog-green/50 focus:border-transparent transition-colors ${
                    errors.email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="tu@email.com"
                />
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Campo Teléfono */}
              <div>
                <label
                  htmlFor="telefono"
                  className="block text-sm font-semibold text-contrast-base mb-2"
                >
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-frog-green/50 focus:border-transparent transition-colors ${
                    errors.telefono
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="+54 11 1234-5678"
                />
                {errors.telefono && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.telefono}
                  </p>
                )}
              </div>

              {/* Campo Archivos */}
              <div>
                <label
                  htmlFor="archivos"
                  className="block text-sm font-semibold text-contrast-base mb-2"
                >
                  Archivos{" "}
                  <span className="text-border-base/80">(opcional)</span>
                </label>
                <input
                  type="file"
                  id="archivos"
                  name="archivos"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  multiple
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-frog-green/50 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-bouncy-lemon/50 file:text-contrast-base hover:file:bg-bouncy-lemon/70 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {formData.archivos && formData.archivos.length > 0 && (
                  <p className="mt-2 text-sm text-border-base">
                    {formData.archivos.length} archivo(s) seleccionado(s)
                  </p>
                )}
              </div>

              {/* Campo Mensaje */}
              <div>
                <label
                  htmlFor="mensaje"
                  className="block text-sm font-semibold text-contrast-base mb-2"
                >
                  Mensaje <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-frog-green/50 focus:border-transparent transition-colors resize-none ${
                    errors.mensaje
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="Cuéntanos sobre tu proyecto..."
                />
                {errors.mensaje && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.mensaje}
                  </p>
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
                    : "bg-toad-eyes hover:brightness-90 active:scale-[0.98] shadow-lg"
                } focus:outline-none focus:ring-4 focus:ring-toad-eyes/40`}
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
                  "¡Enviado! ✓"
                ) : (
                  "Enviar mensaje"
                )}
              </button>

              <p className="text-xs text-border-base/80 text-center">
                Los campos marcados con <span className="text-red-500">*</span>{" "}
                son obligatorios
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;
