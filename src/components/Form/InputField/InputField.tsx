/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, useMemo, useState } from "react";
import {
  Input as ReactAreaInput,
  Label,
  NumberField,
  TextField,
  Button,
} from "react-aria-components";
import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  RegisterOptions,
} from "react-hook-form";

import CloseIcon from "global/assets/images/close-filled.svg?react";
import Eye from "global/assets/images/eye.svg?react";
import EyeOff from "global/assets/images/eye-off.svg?react";
import SearchIcon from "global/assets/images/search-filled.svg?react";
import { combineClassName } from "global/helpers";

import { InputProps, SupportTextMessage } from "components/Form";
import { debounce } from "lodash";

const InputField = <
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  type,
  parentClassName,
  inputFieldClassName,
  labelClassName,
  disable,
  formatOptions,
  maxLength,
  maximumNumber,
  minLength,
  minimumNumber,
  onChange,
  placeholder,
  shouldUnregister,
  step,
  label,
  supportText,
  leadingIcon,
  trailingIcon,
  readOnly,
  variant = "medium",
  hideClearButton = true,
  hideEyeIcon = false,
  className,
  debounceOnChange,
}: InputProps<TFieldValues, Name>) => {
  const rules: Omit<
    RegisterOptions<TFieldValues, Name>,
    "disabled" | "valueAsNumber" | "valueAsDate" | "setValueAs"
  > = {
    onChange: (event) => {
      onChange?.(event?.target?.value);
    },
  };

  const onInputEvent = (
    formEvent: React.FormEvent<HTMLInputElement>,
    onChange: (...event: any[]) => void
  ) => {
    const event = formEvent as ChangeEvent<HTMLInputElement>;
    if (event?.target?.value === "") {
      onChange(null);
    } else if (event?.target.value?.includes(".")) {
      if (event?.target?.value?.split(".")[1]) {
        onChange(+event?.target?.value);
      }
    } else if (!Number.isNaN(+event?.target?.value)) {
      onChange(+event?.target?.value);
    } else if (Number.isNaN(+event?.target?.value)) {
      onChange(null);
    }
  };

  const commonParentClassName = (errorMessage: string | undefined) =>
    combineClassName(
      "bg-inherit relative flex items-center justify-center gap-2 border rounded px-3 py-2.5 transition-all group font-normal",
      !disable && !readOnly
        ? "border-outline-border has-[:focus]:border-primary-main hover:border-black cursor-text"
        : readOnly
        ? "border-outline-border cursor-default"
        : "",
      disable ? "cursor-not-allowed" : "",
      errorMessage ? "border-error-main hover:border-error-main" : "",
      variant === "medium" ? "py-[15px]" : "py-[7px]",
      type === "search" ? "max-w-[220px]" : ""
    );

  const reactAreaInputProps = {
    id: name,
    placeholder: placeholder
      ? placeholder
      : type === "search"
      ? "Search..."
      : "Enter...",
    className: combineClassName(
      "w-full font-roboto bg-inherit rounded-[inherit] text-base peer appearance-none focus:outline-none min-h-[inherit]",
      disable ? "cursor-not-allowed text-disable-text" : "text-primary-text",
      label ? "placeholder-transparent" : "",
      inputFieldClassName
    ),
    autoComplete: "off",
  };

  const labelComponent = (
    errorMessage: string | undefined,
    value: FieldPathValue<TFieldValues, Name>
  ) => (
    <Label
      htmlFor={disable ? "" : name}
      aria-disabled={disable}
      className={combineClassName(
        "font-roboto transition-all max-w-[80%] duration-300 bg-inherit truncate absolute left-2 px-1 text-secondary-text text-base peer-focus:text-xs",
        disable ? "text-disable-text" : "cursor-text",
        errorMessage
          ? "text-error-main peer-focus:text-error-main peer-placeholder-shown:text-error-main group-focus-within:text-error-main"
          : disable || readOnly
          ? ""
          : "peer-focus:text-primary-main group-focus-within:text-primary-main",
        variant === "medium"
          ? "top-3.5 peer-focus:-top-2.5"
          : "top-1.5 peer-focus:-top-2.5",
        value?.toString?.()?.trim()?.length > 0
          ? "-top-2.5 text-xs"
          : readOnly
          ? variant === "medium"
            ? "top-3.5 peer-focus:top-3.5 peer-focus:text-base"
            : "top-1.5 peer-focus:top-1.5 peer-focus:text-base"
          : "",
        labelClassName
      )}
    >
      {label}
    </Label>
  );
  const [showPassword, setShowPassword] = useState(false);

  const showPassWordHandler = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const clearButton = (
    value: FieldPathValue<TFieldValues, Name>,
    onChange: (...event: any[]) => void
  ) => (
    <Button
      slot={null}
      className={combineClassName(
        "grid place-content-center size-6 min-w-6 min-h-6 text-action-active rounded-full hover:bg-action-hover cursor-pointer outline-none focus-visible:ring focus-visible:ring-primary-main",
        disable || readOnly
          ? "invisible"
          : value?.toString?.()?.trim()?.length > 0
          ? "visible"
          : "invisible"
      )}
      onPress={() => {
        if (!disable && !readOnly) {
          onChange(null);
          if (debounceOnChange) {
            debounceOnChange?.(null);
          }
        }
      }}
      isDisabled={disable || readOnly}
    >
      <CloseIcon className="w-5 h-5" />
    </Button>
  );

  const trailingComponent = (
    value: FieldPathValue<TFieldValues, Name>,
    onChange: (...event: any[]) => void
  ) => (
    <div className="flex justify-center items-center gap-2">
      {type === "search"
        ? clearButton(value, onChange)
        : hideClearButton
        ? null
        : clearButton(value, onChange)}
      {type === "password" ? (
        hideEyeIcon ? null : (
          <Button
            slot={null}
            className={combineClassName(
              "grid place-content-center size-6 min-w-6 min-h-6 text-action-active rounded-full hover:bg-action-hover cursor-pointer outline-none focus-visible:bg-action-hover",
              value?.toString?.()?.trim()?.length > 0 ? "visible" : "invisible"
            )}
            onPress={showPassWordHandler}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </Button>
        )
      ) : null}
      {trailingIcon
        ? typeof trailingIcon === "function"
          ? trailingIcon(value)
          : trailingIcon
        : null}
    </div>
  );

  const debounceFn = useMemo(
    () =>
      debounce((value) => {
        if (debounceOnChange) {
          debounceOnChange?.(value);
        }
      }, 1000),
    []
  );

  return (
    <Controller
      name={name}
      control={control}
      shouldUnregister={shouldUnregister}
      rules={rules}
      render={({
        field: { value, onChange, name, ref },
        fieldState: { error },
      }) => {
        const errorMessage = error?.message;
        return (
          <div
            className={combineClassName(
              "w-full bg-white",
              type === "search" ? "w-max" : "",
              className
            )}
          >
            {" "}
            {type === "number" || type === "aadhaar" ? (
              <NumberField
                value={value ? value : value === 0 ? 0 : NaN}
                onInput={(event) => {
                  onInputEvent(event, onChange);
                }}
                minValue={minimumNumber}
                maxValue={maximumNumber}
                aria-labelledby={placeholder || label}
                aria-label={placeholder || label}
                step={step}
                name={name}
                ref={ref}
                formatOptions={{
                  ...formatOptions,
                  useGrouping: formatOptions?.useGrouping
                    ? formatOptions?.useGrouping
                    : false,
                }}
                isDisabled={disable}
                isReadOnly={readOnly}
                className={combineClassName(
                  commonParentClassName(errorMessage),
                  parentClassName
                )}
              >
                {leadingIcon
                  ? typeof leadingIcon === "function"
                    ? leadingIcon(value)
                    : leadingIcon
                  : null}
                <ReactAreaInput {...reactAreaInputProps} />
                {label && labelComponent(errorMessage, value)}
                {trailingComponent(value, onChange)}
              </NumberField>
            ) : (
              <TextField
                type={
                  type === "password"
                    ? showPassword
                      ? "text"
                      : "password"
                    : type === "search"
                    ? "text"
                    : type
                }
                className={combineClassName(
                  commonParentClassName(errorMessage),
                  parentClassName
                )}
                maxLength={maxLength}
                minLength={minLength}
                value={value || ""}
                onChange={(value) => {
                  onChange(value);
                  debounceFn(value);
                }}
                autoComplete="off"
                isDisabled={disable}
                isReadOnly={readOnly}
                onBlur={() => {
                  if (type !== "search" && type !== "password") {
                    onChange(value?.trim() || "");
                  }
                }}
                name={name}
                ref={ref}
              >
                {leadingIcon
                  ? typeof leadingIcon === "function"
                    ? leadingIcon(value)
                    : leadingIcon
                  : null}
                {type === "search" ? (
                  <Label
                    htmlFor={name}
                    className={combineClassName(
                      "text-action-active",
                      disable
                        ? "text-disable-text cursor-not-allowed"
                        : "cursor-text"
                    )}
                  >
                    <SearchIcon className="w-6 h-6" />
                  </Label>
                ) : null}
                <ReactAreaInput {...reactAreaInputProps} />
                {label && labelComponent(errorMessage, value)}
                {trailingComponent(value, onChange)}
              </TextField>
            )}
            <SupportTextMessage error={error} supportText={supportText} />
          </div>
        );
      }}
    />
  );
};

export default InputField;
