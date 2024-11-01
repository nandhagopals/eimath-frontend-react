import {
  type CalendarDate,
  getDayOfWeek,
  getLocalTimeZone,
} from "@internationalized/date";
import { type ElementRef, type FC, useEffect, useRef } from "react";
import { CalendarCell as ReactAriaCalendarCell } from "react-aria-components";

import type { CalendarType } from "components/Form/Date/Calendar";

import { combineClassName } from "global/helpers";
import { isToday } from "date-fns";

interface Props {
  date: CalendarDate;
  locale: string;
  type: CalendarType;
}

const CalendarCell: FC<Props> = ({ date, locale, type }) => {
  const ref = useRef<ElementRef<"td">>(null);

  useEffect(() => {
    if (ref?.current) {
      ref.current.className = "py-0.5 px-0 w-10 h-10";
    }
  }, []);

  const isCurrentDate = isToday(date?.toDate(getLocalTimeZone()));

  return (
    <ReactAriaCalendarCell
      ref={ref}
      date={date}
      className={({
        isHovered,
        isFocusVisible,
        isSelected,
        isOutsideMonth,
        isSelectionStart,
        isSelectionEnd,
        isDisabled,
        isInvalid,
        isUnavailable,
      }) => {
        const dayOfWeek = getDayOfWeek(date, locale);
        const isRoundedLeft =
          isSelected && (isSelectionStart || dayOfWeek === 0 || date.day === 1);
        const isRoundedRight =
          isSelected &&
          (isSelectionEnd ||
            dayOfWeek === 6 ||
            date.day === date.calendar.getDaysInMonth(date));
        return combineClassName(
          "w-10 h-10 outline-none flex justify-center items-center text-xs text-secondary",

          (isHovered || isFocusVisible) && !isSelected
            ? "text-primary-main bg-primary-shade rounded-full"
            : "",
          isFocusVisible && !isSelected
            ? "ring-1 ring-primary-main rounded-full"
            : "",
          isSelected
            ? type === "calendar"
              ? "bg-primary-main text-white rounded-full"
              : "bg-primary-main text-white"
            : isCurrentDate
            ? "bg-primary-shade text-primary-main rounded-full"
            : "",
          isOutsideMonth ? "invisible" : "",
          isRoundedLeft ? "rounded-l-full" : "",
          isRoundedRight ? "rounded-r-full" : "",
          isDisabled ? "text-opacity-[0.12] cursor-default" : "",
          isInvalid || isUnavailable
            ? "bg-error-main text-error-main cursor-not-allowed"
            : ""
        );
      }}
    >
      {({ formattedDate }) => {
        return formattedDate;
      }}
    </ReactAriaCalendarCell>
  );
};

export default CalendarCell;
