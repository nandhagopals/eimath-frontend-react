import { Controller, FieldPath, FieldValues } from "react-hook-form";

import { SwitchProps } from "components/Form/Switch";
import { combineClassName } from "global/helpers";

const Switch = <
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  className,
  disable,
  readOnly,
  label,
  //   loading,
  onChange,
  shouldUnregister,
  defaultValue,
}: SwitchProps<TFieldValues, Name>) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={{
        onChange: (e) => {
          onChange?.(e?.target?.value);
        },
      }}
      shouldUnregister={shouldUnregister}
      render={({ field: { value, onChange, ref } }) => {
        return label ? (
          <div className={combineClassName("flex gap-3", className)}>
            <div className={"inline-flex items-center"}>
              <div
                className={combineClassName(
                  "relative inline-block w-8 h-4 rounded-full",
                  disable
                    ? "cursor-pointer"
                    : readOnly
                    ? "cursor-default"
                    : "cursor-pointer"
                )}
              >
                <input
                  id={name}
                  type="checkbox"
                  checked={value ?? false}
                  onChange={onChange}
                  ref={ref}
                  disabled={disable || readOnly}
                  className={combineClassName(
                    "focus:outline-none absolute w-8 h-[16px] transition-colors duration-300 rounded-full appearance-none peer bg-[#000000]/50  checked:bg-primary-main/60 peer-checked:border-primary-main peer-checked:before:bg-primary-main",
                    disable
                      ? "cursor-pointer"
                      : readOnly
                      ? "cursor-default"
                      : "cursor-pointer"
                  )}
                />
                <label
                  htmlFor={name}
                  className={combineClassName(
                    "before:content[''] absolute top-2/4 -left-1 h-5 w-5 -translate-y-2/4 rounded-full border border-gray-100 bg-white peer-checked:bg-primary-main shadow-md transition-all duration-300 before:absolute before:top-2/4 before:left-2/4 before:block before:h-10 before:w-10 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-gray-500 before:opacity-0 before:transition-opacity  peer-checked:translate-x-full peer-checked:border-primary-main peer-checked:before:bg-primary-main",
                    disable
                      ? "cursor-pointer"
                      : readOnly
                      ? "cursor-default"
                      : "cursor-pointer hover:before:opacity-10"
                  )}
                >
                  <div className="inline-block p-5 rounded-full top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4" />
                </label>
              </div>
            </div>
            <label
              htmlFor={name}
              className={combineClassName(
                "text-base font-normal text-primary-text select-none",
                disable
                  ? "cursor-not-allowed"
                  : readOnly
                  ? "cursor-default"
                  : "cursor-pointer"
              )}
            >
              {label}
            </label>
          </div>
        ) : (
          <div
            className={combineClassName("inline-flex items-center", className)}
          >
            <div
              className={combineClassName(
                "relative inline-block w-8 h-4 rounded-full",
                disable
                  ? "cursor-pointer"
                  : readOnly
                  ? "cursor-default"
                  : "cursor-pointer"
              )}
            >
              <input
                id={name}
                type={"checkbox"}
                checked={value ?? false}
                onChange={onChange}
                ref={ref}
                disabled={disable || readOnly}
                className={combineClassName(
                  "focus:outline-none absolute w-8 h-[16px] transition-colors duration-300 rounded-full appearance-none peer bg-[#000000]/50  checked:bg-primary-main/60 peer-checked:border-primary-main peer-checked:before:bg-primary-main",
                  disable
                    ? "cursor-pointer"
                    : readOnly
                    ? "cursor-default"
                    : "cursor-pointer"
                )}
              />
              <label
                htmlFor={name}
                className={combineClassName(
                  "before:content[''] absolute top-2/4 -left-1 h-5 w-5 -translate-y-2/4 rounded-full border border-gray-100 bg-white peer-checked:bg-primary-main shadow-md transition-all duration-300 before:absolute before:top-2/4 before:left-2/4 before:block before:h-10 before:w-10 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-gray-500 before:opacity-0 before:transition-opacity peer-checked:translate-x-full peer-checked:border-primary-main peer-checked:before:bg-primary-main",
                  disable
                    ? "cursor-pointer"
                    : readOnly
                    ? "cursor-default"
                    : "cursor-pointer hover:before:opacity-10"
                )}
              >
                <div className="inline-block p-5 rounded-full top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4" />
              </label>
            </div>
          </div>
        );
      }}
    />
  );
};

export default Switch;
