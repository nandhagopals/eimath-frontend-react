import { Fragment } from "react";
import { Checkbox as ReactAriaCheckBox } from "react-aria-components";
import {
  Controller,
  type FieldPath,
  type FieldValues,
  type PathValue,
} from "react-hook-form";

import { type CheckBoxProps, CustomCheckbox } from "components/Form/Checkbox";

import { combineClassName } from "global/helpers";

const Checkbox = <
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  className,
  disabled,
  label,
  onChange,
  shouldUnregister,
  readOnly,
}: CheckBoxProps<TFieldValues, Name>) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={{
        onChange: (e) => {
          onChange?.(
            e.target?.value
              ? (true as unknown as PathValue<TFieldValues, Name>)
              : (false as unknown as PathValue<TFieldValues, Name>)
          );
        },
      }}
      shouldUnregister={shouldUnregister}
      render={({ field: { value, onChange, name }, fieldState: { error } }) => {
        return (
          <ReactAriaCheckBox
            isSelected={value ? true : false}
            onChange={onChange}
            className={combineClassName("flex gap-2", className)}
            isDisabled={disabled}
            isReadOnly={readOnly}
            name={name}
          >
            {({ isSelected, isIndeterminate, isDisabled }) => {
              return (
                <Fragment>
                  <CustomCheckbox
                    isChecked={isSelected}
                    className={combineClassName(
                      disabled
                        ? "cursor-not-allowed"
                        : readOnly
                        ? "cursor-default"
                        : "cursor-pointer"
                    )}
                    isIndeterminate={isIndeterminate}
                    error={error}
                    disabled={isDisabled}
                    readOnly={readOnly}
                  />
                  {label && (
                    <p
                      className={`truncate text-sm ${
                        disabled
                          ? "cursor-not-allowed"
                          : readOnly
                          ? "cursor-default"
                          : "cursor-pointer"
                      }`}
                    >
                      {label}
                    </p>
                  )}
                </Fragment>
              );
            }}
          </ReactAriaCheckBox>
        );
      }}
    />
  );
};

export default Checkbox;
