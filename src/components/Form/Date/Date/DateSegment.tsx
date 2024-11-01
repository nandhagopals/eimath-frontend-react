import type { FC } from "react";
import { DateSegment as ReactAriaDateSegment } from "react-aria-components";
import type { DateSegment as DateSegmentProps } from "react-stately";

import { combineClassName } from "global/helpers";

interface Props {
  segment: DateSegmentProps;
}

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DateSegment: FC<Props> = ({ segment }) => {
  return (
    <ReactAriaDateSegment
      segment={segment}
      className={({ isFocusVisible, isFocused, isDisabled }) =>
        combineClassName(
          "outline-none rounded-sm caret-transparent bg-inherit text-secondary-text text-center select-none",
          isDisabled
            ? "text-opacity-[0.38]"
            : isFocusVisible || isFocused
            ? "text-white bg-primary-main"
            : "",
          segment.text === ", " ? "pr-1" : "",
          segment?.type === "month"
            ? "min-w-[32px]"
            : segment?.type === "year"
            ? "min-w-[40px]"
            : segment.type === "hour" ||
              segment?.type === "minute" ||
              segment?.type === "second"
            ? "min-w-[22px]"
            : segment?.type === "dayPeriod"
            ? "min-w-[26px]"
            : ""
        )
      }
    >
      {({ text, isPlaceholder, type }) => {
        return isPlaceholder && type === "month"
          ? "mmm"
          : text === "/"
          ? "/"
          : type === "month"
          ? months[+text - 1]
          : type === "hour" || type === "day"
          ? text?.padStart(2, "0")
          : type === "year"
          ? text?.padStart(4, "0")
          : type === "dayPeriod"
          ? text?.toLowerCase()
          : text;
      }}
    </ReactAriaDateSegment>
  );
};

export default DateSegment;
