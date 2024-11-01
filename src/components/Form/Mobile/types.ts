/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { Control, FieldError, FieldPath, FieldValues } from "react-hook-form";

import {
  LeadingTrailingIcon,
  OptionObject,
  ReactHookFormOnChangeEvent,
  SupportText,
  Variant,
} from "components/Form";

import { defaultZodErrorMessage, mobileNumberZodSchema } from "global/helpers";

const mobileInputSchema = z.object(
  {
    country: z.object(
      {
        id: z.number(),
        name: z.string(),
        isdCode: z.string(),
      },
      defaultZodErrorMessage
    ),
    mobileNumber: mobileNumberZodSchema(true),
  },
  defaultZodErrorMessage
);

type MobileType = z.infer<typeof mobileInputSchema>;

interface MobileProps<
  TFieldValues extends FieldValues = OptionObject,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: Name;
  inputLabel?: string;
  countryLabel?: string;
  onChange?: ReactHookFormOnChangeEvent<TFieldValues, Name>;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  leadingIcon?: LeadingTrailingIcon;
  trailingIcon?: LeadingTrailingIcon;
  placeholder?: string;
  shouldUnregister?: boolean;
  supportTextForMobile?: SupportText;
  supportTextForCountry?: SupportText;
  variant?: Variant;
  hideClearButton?: boolean;
  parentClassName?: string;
  countryClassName?: string;
  inputClassName?: string;
  countryLabelClassName?: string;
  inputLabelClassName?: string;
}

interface MobileCountryFieldProps
  extends Pick<MobileProps, "className" | "disabled" | "readOnly"> {
  onChange: (...event: any[]) => void;
  value: MobileType | null | undefined;
  label?: string;
  error: FieldError | undefined;
  labelClassName?: string;
  variant?: Variant;
  name: string;
  supportText?: SupportText;
}

interface MobileInputFieldProps
  extends Pick<
    MobileProps,
    | "className"
    | "disabled"
    | "readOnly"
    | "placeholder"
    | "trailingIcon"
    | "leadingIcon"
  > {
  onChange: (...event: any[]) => void;
  value: MobileType | null | undefined;
  label?: string;
  error: FieldError | undefined;
  labelClassName?: string;
  variant?: Variant;
  leadingIcon?: LeadingTrailingIcon;
  trailingIcon?: LeadingTrailingIcon;
  name: string;
  supportText?: SupportText;
}

export { mobileInputSchema };

export type {
  MobileProps,
  MobileType,
  MobileCountryFieldProps,
  MobileInputFieldProps,
};
