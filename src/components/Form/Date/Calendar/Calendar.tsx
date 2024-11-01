import { Fragment, useState } from "react";
import {
  Button,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  type CalendarProps,
  type DateValue,
  RangeCalendar,
  type RangeCalendarProps,
  Calendar as ReactAriaCalendar,
  useLocale,
} from "react-aria-components";

import {
  CalendarCell,
  MonthDropdown,
  YearDropdown,
} from "components/Form/Date/Calendar";

import { combineClassName } from "global/helpers";
import ArrowRight from "global/assets/images/chevron-right-filled.svg?react";
import ArrowLeft from "global/assets/images/chevron-left-filled.svg?react";


type RangeCalendarPropsType<T extends DateValue> = Omit<
  RangeCalendarProps<T>,
  "className"
> & {
  className?: string;
  type: "rangeCalendar";
};

type CalendarPropsType<T extends DateValue> = Omit<
  CalendarProps<T>,
  "className"
> & {
  className?: string;
  type: "calendar";
};

type Props<T extends DateValue = DateValue> =
  | CalendarPropsType<T>
  | RangeCalendarPropsType<T>;

const Calendar = <T extends DateValue>(props: Props<T>) => {
  const calendarProps = props.type === "calendar" ? props : null;

  const rangeCalendarProps = props.type === "rangeCalendar" ? props : null;

  const { locale } = useLocale();

  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);


  return props.type === "calendar" ? (
    <ReactAriaCalendar
      aria-label="Calendar"
      className={combineClassName(
        "inline-block p-3 min-w-[300px] max-w-[300px] bg-background rounded-[inherit]",
        props?.className || ""
      )}
      {...calendarProps}
    >
      {({ state }) => {
        return (
          <Fragment>
            <header className="flex justify-between items-center pb-4 bg-inherit">
              <Button
                slot={"previous"}
                className={({ isDisabled }) =>
                  combineClassName(
                    "p-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-main border border-outline focus-visible:border-transparent focus-visible:text-primary-main",
                    isDisabled
                      ? "cursor-not-allowed border-opacity-[0.38]"
                      : "cursor-pointer"
                  )
                }
              >
                {({ isDisabled }) => {
                  return (
                    <ArrowLeft
                      className={combineClassName(
                        "w-6 h-6 text-secondary-text",
                        isDisabled ? "text-opacity-[0.12]" : ""
                      )}
                    />
                  );
                }}
              </Button>
              <div className="flex gap-2">
                <MonthDropdown
                  state={state}
                  setShowMonthDropdown={setShowMonthDropdown}
                  setShowYearDropdown={setShowYearDropdown}
                  showMonthDropdown={showMonthDropdown}
                />
                <YearDropdown
                  state={state}
                  setShowMonthDropdown={setShowMonthDropdown}
                  setShowYearDropdown={setShowYearDropdown}
                  showYearDropdown={showYearDropdown}
                />
              </div>
              <Button
                slot={"next"}
                className={({ isDisabled }) =>
                  combineClassName(
                    "p-1 rounded-full outline-none text-secondary focus-visible:ring-2 focus-visible:ring-primary-main border border-outline focus-visible:border-transparent focus-visible:text-primary-main",
                    isDisabled
                      ? "cursor-not-allowed border-opacity-[0.38] text-opacity-[0.12]"
                      : "cursor-pointer"
                  )
                }
              >
                {({ isDisabled }) => {
                  return (
                    <ArrowRight
                      className={combineClassName(
                        "w-6 h-6 text-secondary-text",
                        isDisabled ? "text-opacity-[0.12]" : ""
                      )}
                    />
                  );
                }}
              </Button>
            </header>
            <CalendarGrid
              className={"min-w-full max-w-full border-collapse flex-1"}
            >
              <CalendarGridHeader>
                {(day) => (
                  <CalendarHeaderCell className="text-center text-xs p-1">
                    {day}
                  </CalendarHeaderCell>
                )}
              </CalendarGridHeader>
              <CalendarGridBody>
                {(date) => (
                  <CalendarCell date={date} locale={locale} type={props.type} />
                )}
              </CalendarGridBody>
            </CalendarGrid>
          </Fragment>
        );
      }}
    </ReactAriaCalendar>
  ) : (
    <RangeCalendar
      aria-label="Calendar"
      className={combineClassName(
        "inline-block p-3 min-w-[300px] max-w-[300px] bg-background",
        props?.className || ""
      )}
      {...rangeCalendarProps}
    >
      {({ state, isDisabled }) => (
        <Fragment>
          <header className="flex justify-between items-center pb-4 bg-inherit">
            <Button
              slot={"previous"}
              className={({ isDisabled }) =>
                combineClassName(
                  "p-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-main border border-outline focus-visible:border-transparent focus-visible:text-primary-main",
                  isDisabled
                    ? "cursor-not-allowed border-opacity-[0.38]"
                    : "cursor-pointer"
                )
              }
            >
              {({ isDisabled }) => {
                return (
                  <ArrowLeft
                    className={combineClassName(
                      "w-6 h-6 text-secondary-text",
                      isDisabled ? "text-opacity-[0.12]" : ""
                    )}
                  />
                );
              }}
            </Button>
            <div className="flex gap-2">
              <MonthDropdown
                state={state}
                setShowMonthDropdown={setShowMonthDropdown}
                setShowYearDropdown={setShowYearDropdown}
                showMonthDropdown={showMonthDropdown}
              />
              <YearDropdown
                state={state}
                setShowMonthDropdown={setShowMonthDropdown}
                setShowYearDropdown={setShowYearDropdown}
                showYearDropdown={showYearDropdown}
              />
            </div>
            <Button
              slot={"next"}
              className={combineClassName(
                "p-1 rounded-full outline-none text-secondary-text focus-visible:ring-2 focus-visible:ring-primary-main border border-outline focus-visible:border-transparent focus-visible:text-primary-main",
                isDisabled
                  ? "cursor-not-allowed border-opacity-[0.38] text-opacity-[0.12]"
                  : "cursor-pointer"
              )}
            >
              {({ isDisabled }) => {
                return (
                  <ArrowRight
                    className={combineClassName(
                      "w-6 h-6 text-secondary-text",
                      isDisabled ? "text-opacity-[0.12]" : ""
                    )}
                  />
                );
              }}
            </Button>
          </header>
          <CalendarGrid
            className={"min-w-full max-w-full border-collapse flex-1"}
          >
            <CalendarGridHeader>
              {(day) => (
                <CalendarHeaderCell className="text-center text-xs p-1">
                  {day}
                </CalendarHeaderCell>
              )}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => (
                <CalendarCell date={date} locale={locale} type={props.type} />
              )}
            </CalendarGridBody>
          </CalendarGrid>
        </Fragment>
      )}
    </RangeCalendar>
  );
};

export default Calendar;
