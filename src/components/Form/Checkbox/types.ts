import type {
  Control,
  FieldError,
  FieldPath,
  FieldValues,
} from "react-hook-form";

import type { ReactHookFormOnChangeEvent } from "components/Form";

interface CheckBoxProps<
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: Name;
  className?: string;
  label?: string;
  shouldUnregister?: boolean;
  onChange?: ReactHookFormOnChangeEvent<TFieldValues, Name>;
  disabled?: boolean;
  readOnly?: boolean;
}

interface CustomCheckboxProps {
  isChecked?: boolean;
  isIndeterminate?: boolean;
  onClick?: () => void;
  className?: string;
  error?: FieldError;
  disabled?: boolean;
  readOnly?: boolean;
}

export type { CustomCheckboxProps, CheckBoxProps };
