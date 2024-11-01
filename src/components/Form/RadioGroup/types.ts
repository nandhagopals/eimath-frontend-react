/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Control,
  FieldPath,
  FieldPathValue,
  FieldValues,
  PathValue,
} from "react-hook-form";

import { ReactHookFormOnChangeEvent, SupportText } from "components/Form";
import { JSXElementConstructor, ReactElement } from "react";

type RadioGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  control: Control<TFieldValues>;
  name: Name;
  onChange?: ReactHookFormOnChangeEvent<TFieldValues, Name>;
  shouldUnregister?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  parentClassName?: string;
  optionClassName?:
    | string
    | ((bag: {
        checked: boolean;
        active: boolean;
        disabled: boolean;
      }) => string);
  by?:
    | (PathValue<TFieldValues, Name> extends null
        ? string
        : keyof PathValue<TFieldValues, Name> & string)
    | ((
        a: PathValue<TFieldValues, Name>,
        b: PathValue<TFieldValues, Name>
      ) => boolean);
  defaultValue?: PathValue<TFieldValues, Name>;
  options: NonNullable<FieldPathValue<TFieldValues, Name>> extends any[]
    ? NonNullable<FieldPathValue<TFieldValues, Name>>
    : NonNullable<FieldPathValue<TFieldValues, Name>>[];
  supportText?: SupportText;
  renderedOption?: (
    option: FieldPathValue<TFieldValues, Name>,
    comboBoxOption: { active: boolean; disabled: boolean; checked: boolean }
  ) => ReactElement<any, string | JSXElementConstructor<any>>;
  optionRenderString?: (
    option: FieldPathValue<TFieldValues, Name> | null
  ) => string;
  canClear?: boolean;
  variant?: "default" | "filled" | "outline";
  label?: string;
  labelClassName?: string;
  classNameForFilledButton?: string;
};

export type { RadioGroupProps };
