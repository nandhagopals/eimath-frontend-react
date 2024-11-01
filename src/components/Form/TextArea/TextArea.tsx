import {
  Label,
  TextArea as ReactAriaTextArea,
  TextField,
} from "react-aria-components";
import { Controller, type FieldPath, type FieldValues } from "react-hook-form";

import type { TextAreaProps } from "components/Form/TextArea";
import { SupportTextMessage } from "components/Form/SupportTextMessage";

import { combineClassName } from "global/helpers";
import { ElementRef, useEffect, useRef } from "react";

const TextArea = <
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  shouldUnregister,
  label,
  placeholder,
  className,
  disable,
  onChange,
  maxLength,
  minLength,
  supportText,
  readOnly,
  inputClassName,
  labelClassName,
  parentClassName,
}: TextAreaProps<TFieldValues, Name>) => {
  const ref = useRef<ElementRef<"textarea">>(null);
  const handleResize = () => {
    const textarea = ref.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height =
        textarea?.scrollHeight < 200 ? `${textarea.scrollHeight}px` : `200px`;
    }
  };

  useEffect(() => {
    const textarea = ref.current;
    if (textarea) {
      textarea.addEventListener("input", handleResize);
      return () => textarea.removeEventListener("input", handleResize);
    }
  }, [ref]);
  
  return (
    <Controller
      name={name}
      rules={{
        onChange: (e) => {
          onChange?.(e?.target?.value);
        },
      }}
      control={control}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState: { error } }) => {
        return (
          <div className={combineClassName("w-full bg-white", className)}>
            <TextField
              {...field}
              isDisabled={disable}
              isReadOnly={readOnly}
              value={field?.value || ""}
              aria-label={label ?? "Text area"}
              aria-labelledby={label ?? "Text area"}
              className={combineClassName(
                "bg-inherit relative flex items-center justify-center gap-2 border rounded px-3 py-2.5 transition-all group font-normal min-h-[72px]",
                !disable && !readOnly
                  ? "border-outline-border has-[:focus]:border-primary-main hover:border-black cursor-text"
                  : readOnly
                  ? "border-outline-border cursor-default"
                  : "",
                disable ? "cursor-not-allowed" : "",
                error?.message ? "border-error-main" : "",
                parentClassName
              )}
              minLength={minLength}
              maxLength={maxLength}
            >
              <ReactAriaTextArea
                placeholder={placeholder || "Enter..."}
                id={name}
                ref={ref}
                autoComplete="off"
                className={combineClassName(
                  "w-full font-roboto bg-inherit rounded-[inherit] text-base peer appearance-none focus:outline-none min-h-[inherit] resize-none peer",
                  disable
                    ? "cursor-not-allowed text-disable-text"
                    : "text-primary-text",
                  label ? "placeholder-transparent" : "",
                  inputClassName
                )}
                disabled={disable || readOnly}
              />
              {label && (
                <Label
                  htmlFor={disable ? "" : name}
                  aria-disabled={disable}
                  className={combineClassName(
                    "font-roboto transition-all max-w-[80%] top-3.5 peer-focus:-top-2.5 duration-300 bg-inherit truncate absolute left-2 px-1 text-secondary-text text-base peer-focus:text-xs",
                    disable ? "text-disable-text" : "cursor-text",
                    error?.message
                      ? "text-error-main peer-focus:text-error-main peer-placeholder-shown:text-error-main group-focus-within:text-error-main"
                      : disable || readOnly
                      ? "peer-focus:text-base peer-focus:top-3.5"
                      : "peer-focus:text-primary-main group-focus-within:text-primary-main",
                    field?.value?.toString?.()?.trim()?.length > 0
                      ? "-top-2.5 text-xs"
                      : "",
                    labelClassName
                  )}
                >
                  {label}
                </Label>
              )}
            </TextField>
            <SupportTextMessage error={error} supportText={supportText} />
          </div>
        );
      }}
    />
  );
};

export default TextArea;
