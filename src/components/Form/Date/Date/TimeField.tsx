import {
  Button,
  DateInput,
  Group,
  Label,
  TimeField as ReactAriaTimeField,
  type TimeFieldProps,
  type TimeValue,
} from "react-aria-components";

import { DateSegment } from "components/Form/Date/Date";

import { combineClassName } from "global/helpers";
import CloseIcon from "global/assets/images/close-filled.svg?react";
import { Variant } from "components/Form/types";

interface Props<T extends TimeValue>
  extends Pick<
    TimeFieldProps<T>,
    | "granularity"
    | "hourCycle"
    | "isDisabled"
    | "maxValue"
    | "minValue"
    | "name"
    | "onBlur"
    | "onChange"
    | "placeholderValue"
    | "shouldForceLeadingZeros"
    | "value"
  > {
  label: string;
  className?: string;
  nullable?: boolean;
  variant?: Variant;
}
const TimeField = <T extends TimeValue>({
  label,
  className,
  nullable = true,
  variant = "medium",
  ...props
}: Props<T>) => {
  return (
    <ReactAriaTimeField
      className={({ isDisabled }) =>
        combineClassName(
          "bg-white border border-outline-border min-h-[56px] has-[:focus]:border-primary-main flex items-center px-4 rounded relative group",
          isDisabled ? "border-opacity-[0.38]" : "",
          variant === "medium" ? "min-h-[54px]" : "min-h-[40px]",
          className || ""
        )
      }
      hourCycle={props?.hourCycle ? props?.hourCycle : 12}
      {...props}
    >
      <Group className={"flex justify-between w-full peer"}>
        <DateInput className={combineClassName("flex")}>
          {(segment) => <DateSegment segment={segment} />}
        </DateInput>

        {nullable ? null : (
          <Button
            slot={null}
            className={({ isFocusVisible }) =>
              combineClassName(
                "h-min w-min outline-none rounded-full",
                isFocusVisible
                  ? "ring-2 ring-primary-main text-primary-main"
                  : ""
              )
            }
          >
            <CloseIcon className={"h-6 w-6 min-w-6 min-h-6"} />
          </Button>
        )}
      </Group>
      <Label className="absolute text-secondary-text px-1 text-xs -top-[9px] bg-inherit peer-focus-within:text-primary-main">
        {label}
      </Label>
    </ReactAriaTimeField>
  );
};

export default TimeField;
