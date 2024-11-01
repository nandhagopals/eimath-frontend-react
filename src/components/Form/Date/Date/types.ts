import type {
  DatePickerProps,
  DateRangePickerProps,
  DateValue,
} from "react-aria-components";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { SupportText } from "components/Form/SupportTextMessage";
import { Variant } from "components/Form/types";

type DateProps<
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  T extends DateValue = DateValue
> = {
  control: Control<TFieldValues>;
  name: Name;
  shouldUnregister?: boolean;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  label: string;
  nullable?: boolean;
  supportText?: SupportText;
  classNameForDatePicker?: string;
  classNameForDateRangePicker?: string;
  variant?: Variant;
} & (
  | ({ type?: "date" | "date-time" } & Pick<
      DatePickerProps<T>,
      | "hourCycle"
      | "isDateUnavailable"
      | "granularity"
      | "maxValue"
      | "minValue"
      | "placeholderValue"
      | "shouldCloseOnSelect"
      | "shouldForceLeadingZeros"
    >)
  | ({ type: "date-range" | "date-time-range" } & Pick<
      DateRangePickerProps<T>,
      | "hourCycle"
      | "isDateUnavailable"
      | "granularity"
      | "maxValue"
      | "minValue"
      | "placeholderValue"
      | "shouldCloseOnSelect"
      | "shouldForceLeadingZeros"
      | "allowsNonContiguousRanges"
      | "endName"
      | "startName"
    >)
);

export type { DateProps };
