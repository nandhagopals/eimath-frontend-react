/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import {
  Button,
  type DatePickerProps,
  type DateValue,
  Dialog,
  Group,
  Label,
  Popover,
  DatePicker as ReactAriaDatePicker,
} from "react-aria-components";
import type { FieldPath, FieldValues, PathValue } from "react-hook-form";

import { Calendar } from "components/Form/Date/Calendar";
import { TimeField } from "components/Form/Date/Date";
import { DateInput } from "components/Form/Date/Date/DateInput";

import CalendarIcon from "global/assets/images/calendar.svg?react";
import CloseIcon from "global/assets/images/close-filled.svg?react";
import { combineClassName } from "global/helpers";
import { Variant } from "components/Form/types";

interface Props<
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  T extends DateValue = DateValue
> extends Pick<
    DatePickerProps<T>,
    | "hourCycle"
    | "isDateUnavailable"
    | "granularity"
    | "maxValue"
    | "minValue"
    | "placeholderValue"
    | "shouldCloseOnSelect"
    | "shouldForceLeadingZeros"
    | "value"
    | "onChange"
    | "name"
    | "isDisabled"
    | "onBlur"
    | "isReadOnly"
    | "isInvalid"
  > {
  label?: string;
  type: "date" | "date-time";
  nullable?: boolean;
  onChangeHookForm: (...event: any[]) => void;
  hookFormValue: PathValue<TFieldValues, Name>;
  classNameForDatePicker?: string;
  variant: Variant;
}

const DatePicker = <
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  T extends DateValue = DateValue
>({
  label,
  type,
  nullable,
  onChangeHookForm,
  hookFormValue,
  classNameForDatePicker,
  variant,
  ...props
}: Props<TFieldValues, Name, T>) => {
  return (
    <ReactAriaDatePicker
      aria-label={label}
      aria-labelledby={label}
      className={({
        isFocusVisible,
        isOpen,
        isFocusWithin,
        isDisabled,
        isInvalid,
      }) =>
        combineClassName(
          "bg-white border border-outline-border text-secondary-text relative min-h-[54px] px-4 grid items-center rounded transition-colors duration-300",
          isDisabled
            ? "border-disable-text/15"
            : props?.isReadOnly
            ? "cursor-default"
            : isOpen || isFocusVisible || isFocusWithin
            ? "border-primary-main"
            : "hover:border-black",
          isInvalid ? "border-error-main hover:border-error-main" : "",
          variant === "medium" ? "min-h-[54px]" : "min-h-[40px]",
          classNameForDatePicker
        )
      }
      {...props}
      hideTimeZone
    >
      {({
        state,
        isFocusVisible,
        isOpen,
        isFocusWithin,
        isDisabled,
        isInvalid,
      }) => {
        return (
          <Fragment>
            <Label
              className={combineClassName(
                "absolute text-xs -top-2 left-3 bg-inherit px-1 truncate max-w-[80%]",
                isDisabled
                  ? "text-disable-text/15 peer-placeholder-shown:text-disable-text/15"
                  : !props?.isReadOnly &&
                    (isFocusVisible || isOpen || isFocusWithin)
                  ? "text-primary-main"
                  : "text-secondary-text",
                isInvalid ? "text-error-main" : ""
              )}
            >
              {label}
            </Label>
            <Group
              className={combineClassName(
                "flex min-h-[inherit] bg-inherit gap-2"
              )}
              isDisabled={props?.isDisabled}
            >
              <DateInput
                className={combineClassName(
                  "flex-1 flex text-base items-center bg-inherit"
                )}
                aria-label={label}
                aria-labelledby={label}
              />
              <div className="flex gap-1 items-center">
                {nullable ||
                isDisabled ||
                props?.isReadOnly ? null : hookFormValue ? (
                  <Button
                    slot={null}
                    className={({ isFocusVisible }) =>
                      combineClassName(
                        "h-min w-min outline-none rounded-full text-secondary-text",
                        isFocusVisible
                          ? "ring-2 ring-primary-main text-primary-main"
                          : ""
                      )
                    }
                    onPress={() => {
                      onChangeHookForm(null);
                      state?.setValue(null);
                    }}
                  >
                    <CloseIcon className={"h-6 w-6 min-w-6 min-h-6"} />
                  </Button>
                ) : null}
                <Button
                  className={({ isFocusVisible, isDisabled }) =>
                    combineClassName(
                      "h-min w-min outline-none rounded-full text-secondary-text",
                      isDisabled
                        ? "text-opacity-[0.38]"
                        : isFocusVisible
                        ? "ring-2 ring-primary-main text-primary-main"
                        : ""
                    )
                  }
                  onPress={() => {
                    if (isOpen) {
                      state?.close();
                    }
                  }}
                >
                  <CalendarIcon className={"w-7 h-7 p-0.5"} />
                </Button>
              </div>
            </Group>
            <Popover
              placement="bottom end"
              className={({ isEntering, isExiting }) =>
                combineClassName(
                  isEntering
                    ? "animate-in fade-in placement-bottom:slide-in-from-top-1 placement-top:slide-in-from-bottom-1 ease-out duration-200"
                    : "",
                  isExiting
                    ? "animate-out fade-out placement-bottom:slide-out-to-top-1 placement-top:slide-out-to-bottom-1 ease-in duration-150"
                    : ""
                )
              }
            >
              <Dialog className="bg-white border rounded-md shadow-md">
                <Calendar type="calendar" />
                {type === "date-time" && props?.granularity !== "day" && (
                  <div className="pb-3 px-3 bg-inherit">
                    <TimeField
                      label={"Time"}
                      value={state?.timeValue}
                      onChange={(e) => state?.setTimeValue(e)}
                      granularity={
                        state?.granularity !== "day"
                          ? state?.granularity
                          : "minute"
                      }
                      hourCycle={props?.hourCycle}
                      isDisabled={props?.isDisabled}
                      name={`${props?.name}calendarTime`}
                    />
                  </div>
                )}
              </Dialog>
            </Popover>
          </Fragment>
        );
      }}
    </ReactAriaDatePicker>
  );
};

export default DatePicker;
