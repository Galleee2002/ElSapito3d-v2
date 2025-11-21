import { Input, FieldWrapper } from "@/components";

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

      <FieldWrapper
        id="street"
        label="Calle y número"
        required
        error={errors?.street}
        inputProps={{
          type: "text",
          value: street,
          onChange: (e) => onStreetChange(e.target.value),
          disabled,
          state: errors?.street ? "error" : "default",
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldWrapper
          id="city"
          label="Ciudad"
          required
          error={errors?.city}
          inputProps={{
            type: "text",
            value: city,
            onChange: (e) => onCityChange(e.target.value),
            disabled,
            state: errors?.city ? "error" : "default",
          }}
        />

        <FieldWrapper
          id="postalCode"
          label="Código Postal"
          required
          error={errors?.postalCode}
          inputProps={{
            type: "text",
            value: postalCode,
            onChange: (e) => onPostalCodeChange(e.target.value),
            disabled,
            state: errors?.postalCode ? "error" : "default",
          }}
        />
      </div>

      <FieldWrapper
        id="province"
        label="Provincia"
        required
        error={errors?.province}
        inputProps={{
          type: "text",
          value: province,
          onChange: (e) => onProvinceChange(e.target.value),
          disabled,
          state: errors?.province ? "error" : "default",
        }}
      />
    </div>
  );
};

export default DeliveryAddressForm;

