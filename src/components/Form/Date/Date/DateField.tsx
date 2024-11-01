import type { DateValue } from "react-aria";
import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import DatePicker from "components/Form/Date/Date/DatePicker";
import DateRangePicker from "components/Form/Date/Date/DateRangePicker";
import type { DateProps } from "components/Form/Date/Date/types";
import { SupportTextMessage } from "components/Form/SupportTextMessage";

import { combineClassName } from "global/helpers";

const DateField = <
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  T extends DateValue = DateValue
>(
  props: DateProps<TFieldValues, Name, T>
) => {
  const {
    control,
    name,
    disabled,
    shouldUnregister,
    type = "date",
    label,
    className,
    granularity,
    hourCycle,
    isDateUnavailable,
    maxValue,
    minValue,
    nullable = false,
    placeholderValue,
    shouldCloseOnSelect,
    shouldForceLeadingZeros,
    readOnly,
    supportText,
    classNameForDatePicker,
    classNameForDateRangePicker,
    variant = "medium",
  } = props;

  const dateRangePickerProps =
    props?.type === "date-range" || props?.type === "date-time-range"
      ? props
      : null;

  return (
    <Controller
      name={name}
      control={control}
      shouldUnregister={shouldUnregister}
      render={({
        field: { name, onChange, onBlur, value },
        fieldState: { error },
      }) => {
        return (
          <div className={combineClassName("w-full bg-background", className)}>
            {type === "date" || type === "date-time" ? (
              <DatePicker
                value={value || null}
                onChange={onChange}
                type={type}
                granularity={
                  granularity
                    ? granularity
                    : type === "date-time"
                    ? "minute"
                    : "day"
                }
                hourCycle={hourCycle || 12}
                isDateUnavailable={isDateUnavailable}
                label={label}
                maxValue={maxValue}
                minValue={minValue}
                placeholderValue={placeholderValue}
                shouldCloseOnSelect={shouldCloseOnSelect}
                shouldForceLeadingZeros={
                  typeof shouldForceLeadingZeros === "boolean"
                    ? shouldForceLeadingZeros
                    : true
                }
                isDisabled={disabled}
                name={name}
                onBlur={onBlur}
                nullable={nullable}
                onChangeHookForm={onChange}
                hookFormValue={value}
                isReadOnly={readOnly}
                isInvalid={!!error?.message}
                classNameForDatePicker={classNameForDatePicker}
                variant={variant}
              />
            ) : (
              <DateRangePicker
                value={value || null}
                onChange={onChange}
                type={type}
                granularity={
                  granularity
                    ? granularity
                    : type === "date-time-range"
                    ? "minute"
                    : "day"
                }
                hourCycle={hourCycle || 12}
                isDateUnavailable={isDateUnavailable}
                label={label}
                maxValue={maxValue}
                minValue={minValue}
                placeholderValue={placeholderValue}
                shouldCloseOnSelect={shouldCloseOnSelect}
                shouldForceLeadingZeros={
                  typeof shouldForceLeadingZeros === "boolean"
                    ? shouldForceLeadingZeros
                    : true
                }
                isDisabled={disabled}
                onBlur={onBlur}
                nullable={nullable}
                allowsNonContiguousRanges={
                  dateRangePickerProps?.allowsNonContiguousRanges
                }
                endName={dateRangePickerProps?.endName}
                startName={dateRangePickerProps?.startName}
                hookFormValue={value}
                onChangeHookForm={onChange}
                isReadOnly={readOnly}
                classNameForDateRangePicker={classNameForDateRangePicker}
                variant={variant}
              />
            )}

            <SupportTextMessage error={error} supportText={supportText} />
          </div>
        );
      }}
    />
  );
};

export default DateField;
