import { Control, FieldPath, FieldValues } from "react-hook-form";

import {
  LeadingTrailingIcon,
  ReactHookFormOnChangeEvent,
  SupportText,
  Variant,
} from "components/Form";

type InputTypes =
  | "email"
  | "number"
  | "text"
  | "aadhaar"
  | "url"
  | "password"
  | "search";

type InputProps<
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: Name;
  control: Control<TFieldValues>;
  type?: InputTypes;
  parentClassName?: string;
  inputFieldClassName?: string;
  labelClassName?: string;
  disable?: boolean;
  readOnly?: boolean;
  onChange?: ReactHookFormOnChangeEvent<TFieldValues, Name>;
  maximumNumber?: number;
  minimumNumber?: number;
  step?: number;
  formatOptions?: Intl.NumberFormatOptions;
  maxLength?: number;
  minLength?: number;
  placeholder?: string;
  shouldUnregister?: boolean;
  label?: string;
  supportText?: SupportText;
  leadingIcon?: LeadingTrailingIcon;
  trailingIcon?: LeadingTrailingIcon;
  variant?: Variant;
  hideClearButton?: boolean;
  hideEyeIcon?: boolean;
  debounceOnChange?: (string: string | null | undefined) => void;
  className?: string;
};

export type { InputProps, InputTypes };
