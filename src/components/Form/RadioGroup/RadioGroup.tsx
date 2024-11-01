/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import { RadioGroup as _RadioGroup } from "@headlessui/react";
import { Controller, FieldPath, FieldValues, PathValue } from "react-hook-form";

import { RadioGroupProps } from "components/Form/RadioGroup/types";
import { SupportTextMessage } from "components/Form/SupportTextMessage";

import { combineClassName } from "global/helpers";
import RadioButtonCheckedIcon from "global/assets/images/radio-button-checked-filled.svg?react";
import RadioButtonUnCheckedIcon from "global/assets/images/radio-button-unchecked-filled.svg?react";

const RadioGroup = <
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  className,
  disabled,
  onChange,
  shouldUnregister,
  by,
  defaultValue,
  options,
  readOnly,
  supportText,
  renderedOption,
  optionClassName,
  canClear = false,
  optionRenderString,
  variant = "default",
  label,
  labelClassName,
  parentClassName,
  classNameForFilledButton,
}: RadioGroupProps<TFieldValues, Name>) => {
  return (
    <Controller
      name={name}
      control={control}
      shouldUnregister={shouldUnregister}
      rules={{
        onChange: (e) => {
          onChange?.(e?.target?.value);
        },
      }}
      defaultValue={defaultValue}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        return (
          <_RadioGroup
            value={value || null}
            onChange={onChange}
            disabled={disabled || readOnly}
            className={combineClassName(
              "w-full grid grid-cols-1 gap-2",
              className
            )}
            as="ul"
            aria-label={"Radio group"}
            by={
              by
                ? (by as any)
                : options?.[0] && typeof options?.[0] === "object"
                ? "id"
                : undefined
            }
            id={name}
          >
            {({ value }) => {
              return (
                <Fragment>
                  {label ? (
                    <_RadioGroup.Label
                      className={combineClassName(
                        "font-normal text-base text-secondary-text",
                        labelClassName
                      )}
                    >
                      {label}
                    </_RadioGroup.Label>
                  ) : null}
                  <div
                    className={combineClassName(
                      "w-full flex",
                      variant === "filled"
                        ? "gap-0 bg-primary-light w-min rounded h-[30px]"
                        : variant === "default"
                        ? "gap-9"
                        : "gap-2",
                      parentClassName
                    )}
                  >
                    {options?.map((option, index) => {
                      return (
                        <_RadioGroup.Option
                          key={
                            typeof option === "object"
                              ? `${option?.id}-${index}`
                              : `${option}-${index}`
                          }
                          value={option}
                          className={({ active, checked, disabled }) =>
                            combineClassName(
                              "flex gap-2 items-center",
                              disabled
                                ? "cursor-not-allowed text-disable-text"
                                : readOnly
                                ? "cursor-default"
                                : "cursor-pointer focus:outline-none ",
                              variant === "default"
                                ? "text-secondary-text rounded"
                                : variant === "filled"
                                ? combineClassName(
                                    "text-primary-dark px-2.5 py-1 first:rounded-l last:rounded-r text-[13px]",
                                    checked
                                      ? "bg-gradient-to-tr from-linear-primary to-linear-gradient-secondary"
                                      : "",
                                    classNameForFilledButton
                                  )
                                : combineClassName(
                                    "text-primary-main px-2.5 py-2 rounded-full border border-primary-main",
                                    checked ? "bg-primary-main text-white" : ""
                                  ),
                              typeof optionClassName === "function"
                                ? optionClassName({ active, checked, disabled })
                                : optionClassName
                            )
                          }
                          disabled={option?.disabled ?? false}
                          onClick={() => {
                            if (!disabled && !readOnly) {
                              if (canClear) {
                                if (
                                  value &&
                                  typeof value === "object" &&
                                  value?.id &&
                                  typeof option === "object" &&
                                  option?.id === value?.id
                                ) {
                                  onChange(null);
                                } else if (
                                  value &&
                                  (typeof value === "string" ||
                                    typeof value === "number") &&
                                  (typeof option === "string" ||
                                    typeof option === "number") &&
                                  option === value
                                ) {
                                  onChange(null);
                                }
                              }
                            }
                          }}
                        >
                          {({ active, disabled, checked }) => {
                            return renderedOption ? (
                              (renderedOption(option as unknown as any, {
                                active,
                                disabled,
                                checked,
                              }) as any)
                            ) : (
                              <Fragment>
                                {variant === "default" ? (
                                  <div
                                    className={combineClassName(
                                      "flex justify-center items-center size-[42px] rounded-full",
                                      !disabled && !readOnly
                                        ? "hover:bg-primary-shade"
                                        : ""
                                    )}
                                  >
                                    {checked ? (
                                      <RadioButtonCheckedIcon className="text-primary-main" />
                                    ) : (
                                      <RadioButtonUnCheckedIcon className="" />
                                    )}
                                  </div>
                                ) : null}
                                {optionRenderString
                                  ? optionRenderString(
                                      option as unknown as PathValue<
                                        TFieldValues,
                                        Name
                                      >
                                    )
                                  : typeof option === "object"
                                  ? option?.name?.toString()
                                  : option?.toString()}
                              </Fragment>
                            );
                          }}
                        </_RadioGroup.Option>
                      );
                    })}
                  </div>
                  <SupportTextMessage error={error} supportText={supportText} />
                </Fragment>
              );
            }}
          </_RadioGroup>
        );
      }}
    />
  );
};

export default RadioGroup;
