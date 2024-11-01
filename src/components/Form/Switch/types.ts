import { Control, FieldPath, FieldValues, PathValue } from "react-hook-form";

import { OptionObject, ReactHookFormOnChangeEvent } from "components/Form";

interface SwitchProps<
  TFieldValues extends FieldValues = OptionObject,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: Name;
  label?: string;
  onChange?: ReactHookFormOnChangeEvent<TFieldValues, Name>;
  disable?: boolean;
  readOnly?: boolean;
  className?: string;
  //   loading?: boolean;
  shouldUnregister?: boolean;
  defaultValue?: PathValue<TFieldValues, Name>;
}

export type { SwitchProps };
