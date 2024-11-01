/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import {
  Button,
  type DateRangePickerProps,
  type DateValue,
  Dialog,
  Group,
  Label,
  Popover,
  DateRangePicker as ReactAriaDateRangePicker,
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
    DateRangePickerProps<T>,
    | "allowsNonContiguousRanges"
    | "startName"
    | "endName"
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
    | "isDisabled"
    | "onBlur"
    | "isReadOnly"
  > {
  label?: string;
  type: "date-range" | "date-time-range";
  nullable?: boolean;
  onChangeHookForm: (...event: any[]) => void;
  hookFormValue: PathValue<TFieldValues, Name>;
  classNameForDateRangePicker?: string;
  variant: Variant;
}

const DateRangePicker = <
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  T extends DateValue = DateValue
>({
  label,
  type,
  nullable,
  onChangeHookForm,
  hookFormValue,
  classNameForDateRangePicker,
  variant,
  ...props
}: Props<TFieldValues, Name, T>) => {
  return (
    <ReactAriaDateRangePicker
      aria-label={label}
      aria-labelledby={label}
      className={({ isFocusVisible, isOpen, isFocusWithin, isDisabled }) =>
        combineClassName(
          "bg-white border border-outline-border text-secondary-text relative  px-4 grid items-center rounded",
          isDisabled
            ? "border-disable-text/15"
            : props?.isReadOnly
            ? "cursor-default"
            : isOpen || isFocusVisible || isFocusWithin
            ? "border-primary-main"
            : "hover:border-black",
          variant === "medium" ? "min-h-[54px]" : "min-h-[40px]",
          classNameForDateRangePicker
        )
      }
      {...props}
      hideTimeZone
    >
      {({ state, isFocusVisible, isOpen, isFocusWithin, isDisabled }) => {
        return (
          <Fragment>
            <Label
              className={combineClassName(
                "absolute text-xs -top-2 left-3 bg-inherit px-1 truncate max-w-[80%]",
                isDisabled
                  ? "text-disable-text/15 peer-placeholder-shown:text-disable-text/15"
                  : isFocusVisible || isOpen || isFocusWithin
                  ? "text-primary-main"
                  : "text-secondary-text"
              )}
            >
              {label}
            </Label>
            <Group
              className={combineClassName(
                "min-h-[inherit] bg-inherit gap-2 w-full flex justify-between"
              )}
            >
              <div
                className={combineClassName(
                  "flex gap-2",
                  type === "date-time-range"
                    ? "grid items-center py-3"
                    : "flex items-center"
                )}
              >
                <DateInput
                  className={combineClassName(
                    "flex text-base items-center bg-inherit"
                  )}
                  slot={"start"}
                  aria-label={label}
                  aria-labelledby={label}
                />
                {type !== "date-time-range" ? (
                  <span aria-hidden="true" className="">
                    –
                  </span>
                ) : null}
                <DateInput
                  className={combineClassName(
                    "flex text-base items-center bg-inherit row-start-2"
                  )}
                  slot={"end"}
                  aria-label={label}
                  aria-labelledby={label}
                />
              </div>
              <div
                className={combineClassName(
                  "flex gap-1 items-center",
                  type === "date-time-range" ? "row-span-2 justify-end" : ""
                )}
              >
                {nullable || isDisabled ? null : hookFormValue ? (
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
                <Calendar type="rangeCalendar" />
                {type === "date-time-range" && (
                  <div className="pb-3 px-3 bg-inherit flex items-center gap-3">
                    <TimeField
                      label={"Start time"}
                      value={state?.timeRange?.start}
                      onChange={(starTime) => state?.setTime("start", starTime)}
                      granularity={
                        state?.granularity !== "day"
                          ? state?.granularity
                          : "minute"
                      }
                      hourCycle={12}
                    />
                    <TimeField
                      label={"End time"}
                      value={state?.timeRange?.end}
                      onChange={(endTime) => state?.setTime("end", endTime)}
                      granularity={
                        state?.granularity !== "day"
                          ? state?.granularity
                          : "minute"
                      }
                      hourCycle={12}
                    />
                  </div>
                )}
              </Dialog>
            </Popover>
          </Fragment>
        );
      }}
    </ReactAriaDateRangePicker>
  );
};

export default DateRangePicker;
