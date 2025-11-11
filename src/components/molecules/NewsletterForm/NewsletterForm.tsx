import { useState, type FormEvent } from "react";
import { Button } from "@/components";
import { cn } from "@/utils";

interface NewsletterFormProps {
  className?: string;
}

const NewsletterForm = ({ className }: NewsletterFormProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Implementar lógica de suscripción
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail("");
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", className)}>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          className={cn(
            "flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-transparent transition-all duration-200",
            "focus:outline-none"
          )}
          style={{ fontFamily: "var(--font-nunito)" }}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="whitespace-nowrap"
        >
          {isSubmitting ? "..." : "Suscribirse"}
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        Recibe ofertas exclusivas y novedades
      </p>
    </form>
  );
};

export default NewsletterForm;
