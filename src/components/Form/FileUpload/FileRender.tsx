/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import type { FieldPath, FieldValues, PathValue } from "react-hook-form";
import { Button } from "react-aria-components";

import Image from "components/Image";

import CloseIcon from "global/assets/images/cancel-filled.svg?react";
import PDFIcon from "global/assets/images/pdf.svg?react";
import FileIcon from "global/assets/images/feed.svg?react";
import { filePreview } from "global/cache/cache";
import { combineClassName, imageMimeTypes } from "global/helpers";

interface Props<
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  file: File;
  onChange: (...event: any[]) => void;
  value: PathValue<TFieldValues, Name>;
  id: string | number;
  classNameForCloseBtn?: string;
  multiple: boolean;
  canClear?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

const FileRender = <
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  file,
  onChange,
  value,
  id,
  classNameForCloseBtn,
  multiple,
  canClear,
  disabled,
  readOnly,
}: Props<TFieldValues, Name>) => {
  const [dataURL, setDataURL] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDataURL(
          typeof e?.target?.result === "string" ? e?.target?.result : null
        );
      };
      reader.readAsDataURL(file);
    }
  }, [file, id]);

  return (
    <div className="relative grid grid-cols-1 gap-2">
      {dataURL && imageMimeTypes.includes(file?.type) ? (
        <Image
          src={dataURL}
          alt={file?.name}
          className="w-[150px] h-[100px] rounded border border-outline-border object-fill cursor-pointer"
          onClick={() => {
            filePreview({
              data: file,
            });
          }}
        />
      ) : file?.type === "application/pdf" ? (
        multiple || canClear ? (
          <div
            onClick={() => {
              if (dataURL) {
                filePreview({
                  data: file,
                });
              }
            }}
            className={`min-w-[100px] h-[100px] rounded border border-outline-variant grid place-content-center ${
              dataURL ? "cursor-pointer" : ""
            }`}
          >
            <PDFIcon className="w-6 h-6 text-secondary-text" />
          </div>
        ) : (
          <PDFIcon
            onClick={() => {
              if (dataURL) {
                filePreview({
                  data: file,
                });
              }
            }}
            className="w-6 h-6 text-secondary-text cursor-pointer"
          />
        )
      ) : (
        <div className="w-full h-[100px] rounded border border-outline-variant grid place-content-center">
          <FileIcon className="w-6 h-6 text-secondary-text" />
        </div>
      )}
      {canClear && !disabled && !readOnly && (
        <Button
          className={({ isFocusVisible }) =>
            combineClassName(
              "p-0 absolute top-2 right-2 z-0 text-error bg-background rounded-full cursor-pointer text-black/25 bg-white focus:outline-none",
              isFocusVisible ? "ring-1 ring-primary-main ring-offset-1" : "",
              classNameForCloseBtn
            )
          }
          onPress={() => {
            onChange(
              !multiple
                ? null
                : value &&
                    Array?.isArray(value) &&
                    value?.filter(
                      (fileList: { id: number | string; file: File }) =>
                        fileList?.id !== id
                    )
            );
          }}
        >
          <CloseIcon />
        </Button>
      )}
      {multiple && file?.name && (
        <p
          className={combineClassName(
            "text-xs font-normal text-[#6D7175] w-[150px] line-clamp-3 text-center"
          )}
        >
          {file?.name}
        </p>
      )}
    </div>
  );
};

export default FileRender;
