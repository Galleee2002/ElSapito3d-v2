# 📧 Configuración de EmailJS - Formulario de Contacto

## 🚀 Guía de Configuración Rápida

### 1. Crear cuenta en EmailJS

1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crea una cuenta gratuita (permite 200 emails/mes)
3. Verifica tu correo electrónico

### 2. Configurar Servicio de Email

1. En el dashboard, ve a **Email Services**
2. Haz clic en **Add New Service**
3. Selecciona tu proveedor (Gmail, Outlook, etc.)
4. Sigue las instrucciones para conectar tu cuenta
5. Guarda el **Service ID** (ejemplo: `service_abc123`)

### 3. Crear Plantilla de Email

1. Ve a **Email Templates**
2. Haz clic en **Create New Template**
3. Usa el siguiente contenido para la plantilla:

**Subject:**

```
Nuevo mensaje de contacto de {{from_name}}
```

**Content:**

```
Nombre: {{from_name}}
Email: {{from_email}}
Teléfono: {{phone}}

Mensaje:
{{message}}

---
Este mensaje fue enviado desde el formulario de contacto del sitio web.
```

4. Guarda y copia el **Template ID** (ejemplo: `template_xyz789`)

### 4. Obtener Public Key

1. Ve a **Account** en el menú
2. Selecciona **API Keys**
3. Copia tu **Public Key** (ejemplo: `A1B2C3D4E5F6G7H8`)

### 5. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_EMAILJS_PUBLIC_KEY=A1B2C3D4E5F6G7H8
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
```

⚠️ **IMPORTANTE:**

- Asegúrate de agregar `.env` a tu `.gitignore`
- Nunca subas las keys al repositorio
- Reinicia el servidor de desarrollo después de agregar las variables

### 6. Verificar Instalación

La dependencia ya está instalada:

```bash
npm install @emailjs/browser
```

### 7. Probar el Formulario

1. Inicia el servidor de desarrollo:

```bash
npm run dev
```

2. Navega a la página de contacto (o donde uses el componente)

3. Completa el formulario y envía un mensaje de prueba

4. Verifica tu email para confirmar la recepción

## 📁 Archivos Creados

```
src/
├── components/
│   └── organisms/
│       └── ContactForm/
│           ├── ContactForm.tsx    # Componente del formulario
│           └── index.ts           # Export del componente
├── hooks/
│   └── useContactForm.ts          # Lógica del formulario
├── types/
│   └── contact.types.ts           # Tipos TypeScript
├── utils/
│   └── validators.ts              # Validaciones
└── pages/
    └── ContactoPage.tsx           # Página de ejemplo
```

## 💡 Uso del Componente

### Uso Básico

```tsx
import ContactForm from "../components/organisms/ContactForm";

const MiPagina = () => {
  return (
    <div>
      <h1>Contáctanos</h1>
      <ContactForm />
    </div>
  );
};

export default MiPagina;
```

### Página Completa

Ya existe un ejemplo completo en `src/pages/ContactoPage.tsx` que puedes usar directamente.

## ✨ Características Implementadas

✅ Validación en tiempo real de todos los campos
✅ Validación estricta de email con regex
✅ Validación estricta de teléfono con regex
✅ Soporte para múltiples archivos adjuntos
✅ Estados de loading, success y error
✅ Mensajes de error específicos por campo
✅ Diseño responsive con Tailwind CSS
✅ Accesibilidad (labels, ARIA, keyboard navigation)
✅ TypeScript estricto sin `any`
✅ Código limpio y reutilizable
✅ Animaciones y feedback visual
✅ Auto-reset después del envío exitoso

## 🎨 Personalización

### Colores

Puedes personalizar los colores editando las clases de Tailwind en `ContactForm.tsx`:

- `bg-blue-600` → Color del botón
- `focus:ring-blue-500` → Color del focus
- `text-red-600` → Color de errores
- `text-green-600` → Color de éxito

### Validaciones

Las validaciones están en `src/utils/validators.ts` y puedes ajustarlas según tus necesidades:

```typescript
// Ejemplo: cambiar longitud mínima del mensaje
if (data.mensaje.trim().length < 20) {
  errors.mensaje = "El mensaje debe tener al menos 20 caracteres";
}
```

### Campos del Formulario

Para agregar nuevos campos:

1. Actualiza `ContactFormData` en `src/types/contact.types.ts`
2. Agrega validación en `src/utils/validators.ts`
3. Actualiza el estado inicial en `src/hooks/useContactForm.ts`
4. Agrega el campo en `ContactForm.tsx`
5. Actualiza la plantilla de EmailJS

## 🐛 Solución de Problemas

### Error: "Error de configuración"

- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que el archivo `.env` esté en la raíz del proyecto
- Reinicia el servidor de desarrollo

### No llegan los emails

- Verifica que el Service ID, Template ID y Public Key sean correctos
- Confirma que el servicio de email esté activo en EmailJS
- Revisa los logs de EmailJS en su dashboard
- Verifica tu carpeta de spam

### Errores de validación

- Los errores se muestran en rojo debajo de cada campo
- Todos los campos son obligatorios excepto los archivos
- El email debe ser válido (formato: `usuario@dominio.com`)
- El teléfono debe tener al menos 8 dígitos
- El mensaje debe tener al menos 10 caracteres

## 📞 Soporte

Si tienes problemas con la configuración:

1. Revisa la documentación oficial de EmailJS: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
2. Verifica que todas las variables de entorno estén correctas
3. Revisa la consola del navegador para errores específicos

## 📝 Notas Adicionales

- La versión gratuita de EmailJS permite 200 emails/mes
- Los archivos adjuntos tienen un límite de tamaño (generalmente 2MB por archivo)
- Para producción, considera actualizar a un plan de pago si necesitas más emails
- Los archivos se envían como base64 en el email
