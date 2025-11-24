import { ContactFormFields } from "@/components";

const ContactFormSection = () => {
  return (
    <section id="contacto" className="py-16 md:py-24 bg-frog-green">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16 text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-baloo">
            ¿Tenes algunda duda?
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            ¿Tienes alguna idea? Contactanos para hacerla realidad
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-6 md:p-8 border border-border-base/10">
            <ContactFormFields
              className="space-y-5"
              inputClassName="focus:ring-frog-green/50"
              labelClassName="text-contrast-base font-semibold"
              buttonClassName="shadow-lg text-contrast-base focus:ring-bouncy-lemon/40"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;
