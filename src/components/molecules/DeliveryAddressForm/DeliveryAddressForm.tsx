import { Input, Textarea } from "@/components/atoms";

interface DeliveryAddressFormProps {
  street: string;
  city: string;
  postalCode: string;
  province: string;
  onStreetChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  errors?: {
    street?: string;
    city?: string;
    postalCode?: string;
    province?: string;
  };
  disabled?: boolean;
}

const DeliveryAddressForm = ({
  street,
  city,
  postalCode,
  province,
  onStreetChange,
  onCityChange,
  onPostalCodeChange,
  onProvinceChange,
  errors,
  disabled = false,
}: DeliveryAddressFormProps) => {
  return (
    <div className="space-y-4 p-4 bg-gray-50 border border-[var(--color-border-base)]/20 rounded-xl">
      <h4
        className="text-base font-semibold text-[var(--color-border-base)]"
        style={{ fontFamily: "var(--font-nunito)" }}
      >
        Datos de envío
      </h4>

      <div>
        <label
          htmlFor="street"
          className="block text-sm font-semibold text-[var(--color-border-base)] mb-2"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          Calle y número *
        </label>
        <Input
          id="street"
          type="text"
          value={street}
          onChange={(e) => onStreetChange(e.target.value)}
          disabled={disabled}
          state={errors?.street ? "error" : "default"}
        />
        {errors?.street && (
          <p className="mt-1 text-sm text-red-500">{errors.street}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-semibold text-[var(--color-border-base)] mb-2"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Ciudad *
          </label>
          <Input
            id="city"
            type="text"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            disabled={disabled}
            state={errors?.city ? "error" : "default"}
          />
          {errors?.city && (
            <p className="mt-1 text-sm text-red-500">{errors.city}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="postalCode"
            className="block text-sm font-semibold text-[var(--color-border-base)] mb-2"
            style={{ fontFamily: "var(--font-nunito)" }}
          >
            Código Postal *
          </label>
          <Input
            id="postalCode"
            type="text"
            value={postalCode}
            onChange={(e) => onPostalCodeChange(e.target.value)}
            disabled={disabled}
            state={errors?.postalCode ? "error" : "default"}
          />
          {errors?.postalCode && (
            <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="province"
          className="block text-sm font-semibold text-[var(--color-border-base)] mb-2"
          style={{ fontFamily: "var(--font-nunito)" }}
        >
          Provincia *
        </label>
        <Input
          id="province"
          type="text"
          value={province}
          onChange={(e) => onProvinceChange(e.target.value)}
          disabled={disabled}
          state={errors?.province ? "error" : "default"}
        />
        {errors?.province && (
          <p className="mt-1 text-sm text-red-500">{errors.province}</p>
        )}
      </div>
    </div>
  );
};

export default DeliveryAddressForm;

