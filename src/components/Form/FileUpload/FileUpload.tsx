import { Button, FileTrigger } from "react-aria-components";
import { Controller, FieldPath, FieldValues } from "react-hook-form";

import { combineClassName, defaultMimeTypes } from "global/helpers";

import { FileUploadProps } from "components/Form/FileUpload";
import FileRender from "./FileRender";
import { toastNotification } from "global/cache";
import { imageMimeTypes } from "global/helpers";
import { uuid } from "global/helpers";

const listFormat = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

const FileUpload = <
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  label,
  name,
  className,
  disabled,
  onChange,
  readOnly,
  shouldUnregister,
  supportText,
  multiple = false,
  mimeTypes = defaultMimeTypes,
  canClear,
  classNameForCloseBtn,
}: FileUploadProps<TFieldValues, Name>) => {
  return (
    <Controller
      name={name}
      control={control}
      shouldUnregister={shouldUnregister}
      disabled={disabled}
      rules={{
        onChange: (e) => {
          onChange?.(e.target?.value);
        },
      }}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const fileList = (Array.isArray(value)
          ? value?.filter(Boolean)
          : [value]?.filter(Boolean)) as unknown as {
          id: string | number;
          file: File;
        }[];

        return (
          <div
            className={combineClassName(
              "w-full bg-background flex flex-col gap-1",
              className
            )}
          >
            <label
              htmlFor={name}
              className="text-xs font-normal text-dark-jungle-green truncate"
            >
              {label}
            </label>

            <div
              className={
                "border border-outline border-dashed border-outline-border rounded-lg w-full flex flex-col justify-center items-center gap-2 outline-offset-4 outline-primary-main p-8"
              }
            >
              {fileList?.length > 0 && (
                <div className="flex flex-wrap gap-4 max-h-96 overflow-y-auto empty:hidden justify-center">
                  {fileList?.map((file, index) => {
                    return file?.file && file?.id ? (
                      <div
                        className={combineClassName(
                          multiple && error?.[index]?.file?.message
                            ? "border rounded-lg border-error-main p-3"
                            : ""
                        )}
                        key={index}
                      >
                        <FileRender
                          value={value}
                          onChange={onChange}
                          file={file?.file}
                          id={file?.id}
                          multiple={multiple}
                          canClear={canClear}
                          classNameForCloseBtn={classNameForCloseBtn}
                          disabled={disabled}
                          readOnly={readOnly}
                        />
                        {multiple && error?.[index]?.file?.message && (
                          <p className="text-xs font-normal text-error-main min-w-36 w-min mt-3">
                            {error?.[index]?.file?.message}
                          </p>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              )}
              {!disabled && !readOnly && (
                <FileTrigger
                  onSelect={(e) => {
                    if (e) {
                      if (multiple) {
                        if (
                          !Array.from(e).some((e) => mimeTypes.includes(e.type))
                        ) {
                          toastNotification([
                            {
                              message: "Unsupported file format",
                              messageType: "error",
                            },
                          ]);
                        } else if (e) {
                          onChange(
                            value
                              ? [
                                  ...value,
                                  ...Array.from(e).map((e) => ({
                                    id: uuid(),
                                    file: e,
                                  })),
                                ]
                              : [
                                  ...Array.from(e).map((e) => ({
                                    id: uuid(),
                                    file: e,
                                  })),
                                ]
                          );
                        } else {
                          onChange(value);
                        }
                      } else {
                        const file = Array.from(e)[0];

                        if (!mimeTypes?.includes(file?.type)) {
                          toastNotification([
                            {
                              message: "Unsupported file format",
                              messageType: "error",
                            },
                          ]);
                        } else if (e) {
                          onChange({
                            id: uuid(),
                            file: file,
                          });
                        }
                      }
                    }
                  }}
                  acceptedFileTypes={mimeTypes}
                  allowsMultiple={multiple}
                >
                  <Button
                    className={({ isFocusVisible }) =>
                      combineClassName(
                        "text-xs font-medium px-2.5 py-1 rounded border border-primary-main focus:outline-none  text-primary-main w-min whitespace-nowrap",
                        isFocusVisible
                          ? "ring-1 ring-primary-main ring-offset-1"
                          : ""
                      )
                    }
                  >
                    {multiple
                      ? "ADD FILES"
                      : fileList?.[0]?.file
                      ? fileList?.[0]?.file?.type &&
                        imageMimeTypes?.includes(fileList?.[0]?.file?.type)
                        ? "REPLACE IMAGE"
                        : "REPLACE FILE"
                      : "ADD FILE"}
                  </Button>
                </FileTrigger>
              )}
              <p
                className={combineClassName(
                  "text-xs font-normal text-[#6D7175]",
                  supportText?.className
                )}
              >
                {!multiple && fileList?.[0]?.file?.name
                  ? fileList?.[0]?.file?.name
                  : supportText?.text ??
                    `Accepts ${listFormat.format(
                      mimeTypes?.map((type) => `.${type?.split("/")[1]}`)
                    )}`}
              </p>
            </div>
          </div>
        );
      }}
    />
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { listFormat };
export default FileUpload;
