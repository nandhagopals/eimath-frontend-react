import { type ForwardedRef, forwardRef, useContext, useRef } from "react";
import { useDateField } from "react-aria";
import {
  DateFieldContext,
  type DateFieldProps,
  DateFieldStateContext,
  type DateInputProps,
  Group,
  GroupContext,
  Input,
  InputContext,
  Provider,
  TimeFieldStateContext,
  useContextProps,
  useLocale,
  DateValue,
} from "react-aria-components";
import { createCalendar } from "@internationalized/date";
import { useDateFieldState } from "react-stately";

import { DateSegment as DateSegmentCom } from "components/Form/Date/Date";

export const DateInput = forwardRef(
  (
    props: Omit<DateInputProps, "children">,
    ref: ForwardedRef<HTMLDivElement>
  ): JSX.Element => {
    const dateFieldState = useContext(DateFieldStateContext);
    const timeFieldState = useContext(TimeFieldStateContext);
    return dateFieldState || timeFieldState ? (
      <DateInputInner {...props} ref={ref} />
    ) : (
      <DateInputStandalone {...props} ref={ref} />
    );
  }
);

const DateInputInner = forwardRef(
  (
    props: Omit<DateInputProps, "children">,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const { className } = props;
    const dateFieldState = useContext(DateFieldStateContext);
    const timeFieldState = useContext(TimeFieldStateContext);
    const state = dateFieldState ?? timeFieldState!;

    const segmentsArray =
      state?.segments[0]?.type === "day"
        ? state?.segments
        : [
            state?.segments[2],
            state?.segments[1],
            state?.segments[0],
            ...state.segments.filter((segment, i) => {
              if (i === 1 || i === 2 || i === 0) {
                return null;
              } else {
                return segment;
              }
            }),
          ];

    return (
      <>
        <Group
          {...props}
          ref={ref}
          slot={props.slot || undefined}
          className={className ?? "react-aria-DateInput"}
          isInvalid={state?.isInvalid}
          isDisabled={state?.isDisabled}
        >
          {segmentsArray?.map((segment, i) => {
            return <DateSegmentCom key={i} segment={segment} />;
          })}
        </Group>
        <Input />
      </>
    );
  }
);

const DateInputStandalone = forwardRef(
  (
    props: Omit<DateInputProps, "children">,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    const [dateFieldProps, fieldRef] = useContextProps(
      { slot: props.slot } as DateFieldProps<DateValue>,
      ref,
      DateFieldContext
    );
    const { locale } = useLocale();
    const state = useDateFieldState({
      ...dateFieldProps,
      locale,
      createCalendar,
    });

    const inputRef = useRef<HTMLInputElement>(null);
    const { fieldProps, inputProps } = useDateField(
      { ...dateFieldProps, inputRef },
      state,
      fieldRef
    );

    return (
      <Provider
        values={[
          [DateFieldStateContext, state],
          [InputContext, { ...inputProps, ref: inputRef }],
          [
            GroupContext,
            { ...fieldProps, ref: fieldRef, isInvalid: state.isInvalid },
          ],
        ]}
      >
        <DateInputInner {...props} />
      </Provider>
    );
  }
);
