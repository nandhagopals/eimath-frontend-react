/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSXElementConstructor, ReactElement } from "react";
import {
  Control,
  FieldPath,
  FieldPathValue,
  FieldValues,
  PathValue,
} from "react-hook-form";

import {
  LeadingTrailingIcon,
  OptionObject,
  ReactHookFormOnChangeEvent,
  SupportText,
  Variant,
} from "components/Form";

import { Observe } from "global/hook";

interface SelectProps<
  TFieldValues extends FieldValues = OptionObject,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: Name;
  label?: string;
  options: NonNullable<FieldPathValue<TFieldValues, Name>> extends any[]
    ? NonNullable<FieldPathValue<TFieldValues, Name>>
    : NonNullable<FieldPathValue<TFieldValues, Name>>[];
  onChange?: ReactHookFormOnChangeEvent<TFieldValues, Name>;
  disabled?: boolean;
  readOnly?: boolean;
  multiple?: boolean;
  className?: string;
  loading?: boolean;
  leadingIcon?: LeadingTrailingIcon;
  trailingIcon?: LeadingTrailingIcon;
  observe?: Observe<HTMLDivElement>;
  renderedOption?: (
    option: FieldPathValue<TFieldValues, Name>,
    comboBoxOption: { active: boolean; disabled: boolean; selected: boolean }
  ) => ReactElement<any, string | JSXElementConstructor<any>>;
  placeholder?: string;
  searchKeys?: FieldPathValue<TFieldValues, Name> extends string | number
    ? undefined
    : FieldPathValue<TFieldValues, Name> extends object
    ? (keyof FieldPathValue<TFieldValues, Name>)[]
    : undefined;
  shouldUnregister?: boolean;
  supportText?: SupportText;
  by?: PathValue<TFieldValues, Name> extends string | number
    ? undefined
    :
        | (PathValue<TFieldValues, Name> extends null
            ? string
            : keyof PathValue<TFieldValues, Name> & string)
        | ((
            a: PathValue<TFieldValues, Name>,
            b: PathValue<TFieldValues, Name>
          ) => boolean);
  variant?: Variant;
  onInputChange?: (value?: string | null) => void;
  //   searchInput?: boolean;
  canClear?: boolean;
  optionRenderString?: (
    option: FieldPathValue<TFieldValues, Name> | null
  ) => string;
  valueRenderString?: (option: PathValue<TFieldValues, Name> | null) => string;
  defaultValue?: PathValue<TFieldValues, Name>;
}

export type { SelectProps };
