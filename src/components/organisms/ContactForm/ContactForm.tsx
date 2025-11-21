import { ContactFormFields } from "@/components";

const ContactForm = () => {
  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <ContactFormFields showTitle title="Formulario de Contacto" />
      </div>
    </div>
  );
};

export default ContactForm;

