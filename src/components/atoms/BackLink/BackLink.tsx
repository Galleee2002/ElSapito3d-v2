import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface BackLinkProps {
  to: string;
  children: ReactNode;
}

const BackLink = ({ to, children }: BackLinkProps) => {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 text-sm sm:text-base text-text-muted hover:text-text-main mb-6 transition-colors"
      style={{ fontFamily: "var(--font-nunito)" }}
    >
      <span>←</span>
      <span>{children}</span>
    </Link>
  );
};

export default BackLink;


