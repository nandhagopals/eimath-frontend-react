import {
  Controller,
  FieldError,
  FieldPath,
  FieldValues,
} from "react-hook-form";

import { combineClassName } from "global/helpers";

import { OptionObject } from "components/Form";
import {
  MobileCountryField,
  MobileType,
  MobileProps,
  MobileInput,
} from "components/Form/Mobile";

const Mobile = <
  TFieldValues extends FieldValues = OptionObject,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  className,
  countryClassName,
  countryLabel,
  countryLabelClassName,
  disabled,
  inputClassName,
  inputLabelClassName,
  leadingIcon,
  inputLabel,
  onChange,
  placeholder,
  readOnly,
  shouldUnregister,
  trailingIcon,
  variant = "medium",
  parentClassName,
  // hideClearButton,
  supportTextForCountry,
  supportTextForMobile,
}: MobileProps<TFieldValues, Name>) => {
  return (
    <Controller
      control={control}
      name={name}
      shouldUnregister={shouldUnregister}
      rules={{
        onChange: (event) => {
          onChange?.(event?.target?.value);
        },
      }}
      render={({ field: { value, onChange, name }, fieldState: { error } }) => {
        const mobileValue = value as unknown as MobileType | null | undefined;

        const countryError = (
          error as unknown as { country?: FieldError | undefined }
        )?.country;

        const mobileInputError = (
          error as unknown as { mobileNumber?: FieldError | undefined }
        )?.mobileNumber;

        return (
          <div className={combineClassName("w-full bg-white", className)}>
            <div
              className={combineClassName(
                "grid grid-cols-[120px_1fr] gap-2.5 items-start",
                parentClassName
              )}
            >
              <MobileCountryField
                error={error?.message ? error : countryError}
                onChange={onChange}
                value={mobileValue}
                className={countryClassName}
                disabled={disabled}
                label={countryLabel}
                labelClassName={countryLabelClassName}
                readOnly={readOnly}
                variant={variant}
                name={name}
                supportText={supportTextForCountry}
              />
              <MobileInput
                error={error?.message ? error : mobileInputError}
                onChange={onChange}
                value={mobileValue}
                className={inputClassName}
                disabled={disabled}
                label={inputLabel}
                labelClassName={inputLabelClassName}
                readOnly={readOnly}
                variant={variant}
                leadingIcon={leadingIcon}
                placeholder={placeholder}
                trailingIcon={trailingIcon}
                name={name}
                supportText={supportTextForMobile}
              />
            </div>
          </div>
        );
      }}
    />
  );
};

export default Mobile;
