import { ReactNode } from "react";
import { Navbar, Button } from "@/components";

interface PaymentStatusPageProps {
  icon: ReactNode;
  title: string;
  message: string;
  actions?: ReactNode;
  additionalContent?: ReactNode;
  iconBgColor?: string;
  iconBorderColor?: string;
  iconColor?: string;
}

const PaymentStatusPage = ({
  icon,
  title,
  message,
  actions,
  additionalContent,
  iconBgColor = "rgba(34, 197, 94, 0.15)",
  iconBorderColor = "#22c55e",
  iconColor = "#22c55e",
}: PaymentStatusPageProps) => {
  return (
    <div className="min-h-screen bg-bg text-text-main">
      <Navbar />
      <div className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-14 md:pb-16 px-4 sm:px-5 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface rounded-3xl border border-border-base p-8 sm:p-10 text-center shadow-sm">
            <div className="flex justify-center mb-6">
              <div
                className="p-4 rounded-full"
                style={{
                  backgroundColor: iconBgColor,
                  border: `2px solid ${iconBorderColor}`,
                }}
              >
                <div style={{ color: iconColor }}>{icon}</div>
              </div>
            </div>

            <h1
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-baloo)" }}
            >
              {title}
            </h1>

            <p
              className="text-lg text-text-muted mb-8"
              style={{ fontFamily: "var(--font-nunito)" }}
            >
              {message}
            </p>

            {additionalContent}

            {actions && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;

