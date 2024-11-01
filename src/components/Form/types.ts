import { ReactNode } from "react";
import { FieldPath, FieldPathValue, FieldValues } from "react-hook-form";

type ReactHookFormOnChangeEvent<
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = (value: FieldPathValue<TFieldValues, Name>) => void;

interface OptionObject {
  id: number | string;
  name: string;
  disabled?: boolean;
}
type Variant = "small" | "medium";

type LeadingTrailingIcon =
  | (<
      TFieldValues extends FieldValues = FieldValues,
      Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
    >(
      value: FieldPathValue<TFieldValues, Name>
    ) => ReactNode)
  | ReactNode;

export type {
  ReactHookFormOnChangeEvent,
  OptionObject,
  Variant,
  LeadingTrailingIcon,
};
