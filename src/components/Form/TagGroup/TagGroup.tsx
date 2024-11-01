import {
  Label,
  Tag,
  TagList,
  TagGroup as _TagGroup,
} from "react-aria-components";
import { Controller, FieldPath, FieldValues } from "react-hook-form";

import { ITag, TagGroupProps } from "components/Form/TagGroup";

import { combineClassName } from "global/helpers";

const TagGroup = <
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  Tag extends ITag = ITag
>({
  tags,
  selectionMode = "single",
  control,
  variant = "outline",
  name,
  loading,
  className,
  label,
  readOnly = false,
  disabled = false,
  onChange,
}: TagGroupProps<TFieldValues, Name, Tag>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{
        onChange: (e) => {
          onChange?.(e?.target?.value);
        },
      }}
      render={({ field: { value, onChange } }) => {
        return (
          <_TagGroup
            selectedKeys={value}
            onSelectionChange={onChange}
            selectionMode={selectionMode}
            aria-label={name}
            disabledKeys={
              readOnly || disabled
                ? tags?.map((tag) => tag?.id)
                : tags?.filter((tag) => tag?.disabled)?.map((tag) => tag?.id) ||
                  []
            }
            className={combineClassName("flex items-center gap-2", className)}
          >
            {label ? (
              <Label className="text-base font-roboto text-secondary-text">
                {label}
              </Label>
            ) : null}
            <TagList
              renderEmptyState={() =>
                loading ? (
                  <div className="flex gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <span
                        key={i}
                        className="py-[3px] px-1.5 text-xs min-w-24 min-h-9 rounded-2xl outline-none animate-pulse bg-slate-200 border border-slate-200"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-primary-text/40 px-3 text-sm border rounded">
                    No data found..
                  </p>
                )
              }
              className={combineClassName(
                "outline-none flex flex-wrap",
                variant === "filled"
                  ? combineClassName("rounded")
                  : combineClassName("gap-2.5")
              )}
            >
              {tags?.map((tag, i) => {
                return (
                  <Tag
                    key={i}
                    id={tag?.id}
                    textValue={tag?.name}
                    className={({ isSelected, isFocusVisible }) =>
                      combineClassName(
                        "py-2 px-2.5 text-xs w-min outline-none",
                        variant === "outline"
                          ? combineClassName(
                              "rounded-2xl  transition-all duration-300 ease-linear border border-primary-main font-roboto",
                              isSelected
                                ? "text-white bg-primary-main"
                                : "text-primary-main"
                            )
                          : combineClassName(
                              "text-primary-dark first:rounded-l-md last:rounded-r",
                              isSelected
                                ? "bg-gradient-to-tr from-linear-primary to-linear-gradient-secondary"
                                : "bg-primary-light"
                            ),
                        disabled
                          ? "cursor-not-allowed"
                          : readOnly
                          ? "cursor-default"
                          : "cursor-pointer",
                        isFocusVisible
                          ? "ring-1 ring-primary-main ring-offset-1"
                          : ""
                      )
                    }
                  >
                    {tag?.name}
                  </Tag>
                );
              })}
            </TagList>
          </_TagGroup>
        );
      }}
    />
  );
};

export default TagGroup;
