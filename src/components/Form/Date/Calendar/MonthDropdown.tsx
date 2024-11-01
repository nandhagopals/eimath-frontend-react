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
  showMonthDropdown: boolean;
}
const MonthDropdown: FC<Props> = ({
  state,
  setShowMonthDropdown,
  setShowYearDropdown,
  showMonthDropdown,
}) => {
  const months: string[] = [];

  const formatter = useDateFormatter({
    month: "long",
    timeZone: state?.timeZone,
  });

  const numMonths = state.focusedDate.calendar.getMonthsInYear(
    state.focusedDate
  );

  const startDate = state?.minValue;
  const endDate = state?.maxValue;

  if (startDate && endDate && startDate?.year === endDate?.year) {
    if (startDate?.month === endDate?.month) {
      const date = state?.focusedDate.set({ month: startDate?.month });
      months.push(formatter.format(date.toDate(state.timeZone)));
    } else {
      for (let i = startDate?.month; i <= endDate?.month; i++) {
        const date = state?.focusedDate.set({ month: i });
        months.push(formatter.format(date.toDate(state.timeZone)));
      }
    }
  } else {
    for (let i = 1; i <= numMonths; i++) {
      const date = state?.focusedDate.set({ month: i });
      months.push(formatter.format(date.toDate(state.timeZone)));
    }
  }

  return (
    <Select
      onSelectionChange={(month) => {
        const monthIndex =
          months.findIndex((monthFilter) => monthFilter === month) + 1;
        const date = state?.focusedDate?.set({ month: monthIndex });
        state.setFocusedDate(date);
      }}
      defaultSelectedKey={formatter.format(
        state.focusedDate.toDate(state.timeZone)
      )}
      isOpen={showMonthDropdown}
      onOpenChange={(isOpen) => {
        setShowYearDropdown(false);
        setShowMonthDropdown(isOpen);
      }}
      selectedKey={formatter.format(state.focusedDate.toDate(state.timeZone))}
      aria-label="Month dropdown"
      aria-labelledby="Month dropdown"
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
                {months?.map((month) => {
                  return (
                    <ListBoxItem
                      key={month}
                      id={month}
                      className={({ isHovered, isSelected }) =>
                        combineClassName(
                          "px-4 py-1.5 text-sm font-normal text-primary-text cursor-pointer truncate outline-none",
                          isSelected ? "bg-primary-shade" : "",
                          isHovered ? "bg-action-hover" : ""
                        )
                      }
                    >
                      {month}
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
export default MonthDropdown;
