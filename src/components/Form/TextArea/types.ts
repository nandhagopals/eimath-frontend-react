import type { Control, FieldPath, FieldValues } from "react-hook-form";

import type { ReactHookFormOnChangeEvent, SupportText } from "components/Form";

export type TextAreaProps<
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  control: Control<TFieldValues>;
  name: Name;
  className?: string;
  maxLength?: number;
  minLength?: number;
  onChange?: ReactHookFormOnChangeEvent<TFieldValues, Name>;
  disable?: boolean;
  readOnly?: boolean;
  shouldUnregister?: boolean;
  supportText?: SupportText;
  label?: string;
  placeholder?: string;
  parentClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
};
