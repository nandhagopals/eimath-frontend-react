import { FC } from "react";
import { Label } from "react-aria-components";

import { MobileInputFieldProps } from "components/Form/Mobile/types";
import { SupportTextMessage } from "components/Form/SupportTextMessage";

import { combineClassName } from "global/helpers";

const MobileInput: FC<MobileInputFieldProps> = ({
  error,
  onChange,
  value,
  className,
  disabled,
  label,
  labelClassName,
  leadingIcon,
  placeholder,
  readOnly,
  trailingIcon,
  variant,
  name,
  supportText,
  // hideClearButton,
}) => {
  return (
    <div>
      <label
        htmlFor={`${name}-mobile-input`}
        className={combineClassName(
          "w-full bg-white relative transition-colors duration-300 border rounded border-outline-border flex items-center p-3",
          variant === "medium" ? "min-h-[56px]" : "min-h-[40px]",
          disabled
            ? "cursor-not-allowed border-disable-text/15"
            : readOnly
            ? "cursor-default"
            : "cursor-text hover:border-black",
          error?.message
            ? "hover:border-error-main border-error-main has-[:focus]:border-error-main"
            : "has-[:focus]:border-primary-main",
          className
        )}
      >
        {leadingIcon
          ? typeof leadingIcon === "function"
            ? leadingIcon(value)
            : leadingIcon
          : null}
        <input
          id={`${name}-mobile-input`}
          type="tel"
          className={combineClassName(
            "w-full peer outline-none placeholder-transparent bg-inherit",
            disabled
              ? "cursor-not-allowed text-disable-text/15 select-none"
              : readOnly
              ? "cursor-default"
              : "cursor-text"
          )}
          disabled={readOnly || disabled}
          onKeyDown={(e) => {
            const key = e.key;
            const ctrlKey = e.ctrlKey;
            if (/\d/.test(key)) {
              return;
            }
            const allowedKeys = ["Backspace", "Control", "Alt", "Shift","Tab"];
            if (allowedKeys.includes(key)) {
              return;
            }
            if (
              ctrlKey &&
              (key === "a" ||
                key === "A" ||
                key === "c" ||
                key === "C" ||
                key === "v" ||
                key === "V")
            ) {
              return;
            }

            e.preventDefault();
          }}
          value={value?.mobileNumber ?? ""}
          onChange={(e) => {
            onChange({
              ...value,
              mobileNumber: e?.target?.value,
            });
          }}
          placeholder={placeholder ?? "Enter mobile..."}
          autoComplete="off"
        />
        {label && (
          <Label
            htmlFor={`${name}-mobile-input`}
            className={combineClassName(
              "max-w-[60%] truncate absolute  px-1 text-secondary-text text-base top-1/2 left-2 [transform:translateY(-50%)] transition-all duration-300 bg-inherit peer-focus:top-0 peer-focus:text-xs ",
              disabled
                ? "cursor-not-allowed text-disable-text/15 select-none"
                : readOnly
                ? "cursor-default"
                : "cursor-text",
              value?.mobileNumber &&
                value?.mobileNumber?.toString()?.trim()?.length > 0
                ? "text-xs top-0"
                : "",
              error?.message
                ? "text-error-main peer-focus:text-error-main"
                : "peer-focus:text-primary-main",
              labelClassName
            )}
          >
            {label}
          </Label>
        )}
        {trailingIcon
          ? typeof trailingIcon === "function"
            ? trailingIcon(value)
            : trailingIcon
          : null}
      </label>
      <SupportTextMessage error={error} supportText={supportText} />
    </div>
  );
};

export default MobileInput;
