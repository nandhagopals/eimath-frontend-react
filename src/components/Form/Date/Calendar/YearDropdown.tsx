import { type CalendarDate, parseDate, today } from "@internationalized/date";
import { type FC, Fragment } from "react";
import { useDateFormatter } from "react-aria";
import {
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
} from "react-aria-components";

import type { CalendarState, RangeCalendarState } from "react-stately";

import type { SetState } from "global/types";
import { combineClassName } from "global/helpers";

interface Props {
  state: CalendarState | RangeCalendarState;
  setShowYearDropdown: SetState<boolean>;
  setShowMonthDropdown: SetState<boolean>;
  showYearDropdown: boolean;
}

const YearDropdown: FC<Props> = ({
  state,
  setShowMonthDropdown,
  setShowYearDropdown,
  showYearDropdown,
}) => {
  let years: { date: CalendarDate; formatted: string }[] = [];
  const formatter = useDateFormatter({
    year: "numeric",
    timeZone: state.timeZone,
  });

  // Format 60 years on each side of the current year according
  // to the current locale and calendar system.

  const startYear = state?.minValue?.year;

  const endYear = state?.maxValue?.year;

  if (startYear && endYear) {
    if (startYear === endYear) {
      years = [
        {
          date: state?.focusedDate,
          formatted: startYear?.toString(),
        },
      ];
    } else {
      for (let year = startYear; year <= endYear; year++) {
        const date = parseDate(
          new Date(
            new Date().setFullYear(
              year,
              state.focusedDate?.month,
              state?.focusedDate?.day
            )
          )
            .toISOString()
            ?.slice(0, 10)
        );
        years.push({
          date,
          formatted: year?.toString(),
        });
      }
    }
  } else if (state?.maxValue && !state?.minValue) {
    for (
      let year = state?.maxValue?.year - 100;
      year <= state?.maxValue?.year;
      year++
    ) {
      const date = parseDate(
        new Date(
          new Date().setFullYear(
            year,
            state?.focusedDate?.month,
            state?.focusedDate?.day
          )
        )
          .toISOString()
          ?.slice(0, 10)
      );
      years.push({
        date,
        formatted: year?.toString(),
      });
    }
  } else if (state?.minValue && !state?.maxValue) {
    for (
      let year = state?.minValue?.year;
      year <= today(state.timeZone).year + 60;
      year++
    ) {
      const date = parseDate(
        new Date(
          new Date().setFullYear(
            year,
            state?.focusedDate.month,
            state?.focusedDate.day
          )
        )
          .toISOString()
          ?.slice(0, 10)
      );
      years.push({
        date,
        formatted: year?.toString(),
      });
    }
  } else {
    for (let i = -100; i <= 100; i++) {
      const date = today(state?.timeZone).add({ years: i });
      years.push({
        date,
        formatted: formatter.format(date.toDate(state.timeZone)),
      });
    }
  }

  return (
    <Select
      onSelectionChange={(key) => {
        const date = state?.focusedDate.set({
          year: +key,
        });
        state.setFocusedDate(date);
      }}
      defaultSelectedKey={state?.focusedDate?.year?.toString()}
      isOpen={showYearDropdown}
      onOpenChange={(isOpen) => {
        setShowMonthDropdown(false);
        setShowYearDropdown(isOpen);
      }}
      selectedKey={state?.focusedDate?.year?.toString()}
      aria-label="Year dropdown"
      aria-labelledby="Year dropdown"
    >
      {({ isOpen }) => {
        return (
          <Fragment>
            <Button
              className={`bg-white appearance-none cursor-pointer text-xs  p-1 rounded-md ${
                isOpen
                  ? "outline-none ring-2 ring-primary-main"
                  : "focus:outline-none focus:ring-2 focus:ring-primary-main"
              }`}
            >
              <SelectValue />
            </Button>
            <Popover
              className={
                "shadow border rounded focus:outline-none min-w-[200px] bg-white"
              }
              placement="bottom"
            >
              <ListBox
                className={
                  "max-h-60 py-2 px-2 overflow-auto bg-inherit text-base shadow-lg focus:outline-none rounded"
                }
              >
                {years?.map((year) => {
                  return (
                    <ListBoxItem
                      key={year?.formatted}
                      id={year?.formatted}
                      value={year.date}
                      className={({ isHovered, isSelected }) =>
                        combineClassName(
                          "px-4 py-1.5 text-sm font-normal text-primary-text cursor-pointer truncate outline-none",
                          isSelected ? "bg-primary-shade" : "",
                          isHovered ? "bg-action-hover" : ""
                        )
                      }
                    >
                      {year?.formatted}
                    </ListBoxItem>
                  );
                })}
              </ListBox>
            </Popover>
          </Fragment>
        );
      }}
    </Select>
  );
};

export default YearDropdown;
