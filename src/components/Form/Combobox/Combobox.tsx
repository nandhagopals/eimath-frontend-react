/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useEffect, useMemo, useState } from "react";
import { Controller, FieldPath, FieldValues, PathValue } from "react-hook-form";
import { Button } from "react-aria-components";
import { Transition, Combobox as _Combobox } from "@headlessui/react";
import {
  FloatingPortal,
  autoUpdate,
  flip,
  size,
  offset,
} from "@floating-ui/react";
import { useFloating } from "@floating-ui/react-dom";

import { ComboboxProps } from "components/Form/Combobox";
import { SupportTextMessage, OptionObject } from "components/Form";
import { ScrollArea, ScrollBar } from "components/ScrollArea";

import { combineClassName, uuid } from "global/helpers";
import CancelIcon from "global/assets/images/cancel-filled.svg?react";
import CloseIcon from "global/assets/images/close-filled.svg?react";
import DropdownIcon from "global/assets/images/arrow-drop-down-filled.svg?react";
import useSearch from "global/hook/useSearch";

const Combobox = <
  TFieldValues extends FieldValues = OptionObject,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  options,
  label,
  onChange,
  multiple,
  className,
  leadingIcon,
  trailingIcon,
  loading,
  observe,
  onInputChange,
  renderedOption,
  placeholder,
  searchKeys,
  shouldUnregister,
  supportText,
  by,
  disabled,
  readOnly,
  variant = "medium",
  optionRenderString,
  valueRenderString,
  defaultValue,
  canClear = false,
  placement,
  classNameForMultipleValueItem,
  classNameForParent,
  classNameForLabel,
  allowCustomValue,
  allowCustomValueAsString,
}: ComboboxProps<TFieldValues, Name>) => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    refs: { setReference, setFloating, reference },
    floatingStyles,
  } = useFloating({
    placement: placement ?? "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      flip({
        fallbackPlacements: ["top"],
      }),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            maxWidth: `${
              rects?.reference?.width && rects?.reference?.width > 220
                ? reference?.current?.getBoundingClientRect()?.width
                : 220
            }px`,
            minWidth: `${
              rects?.reference?.width && rects?.reference?.width > 220
                ? rects?.reference?.width
                : 220
            }px`,
            zIndex: 10,
          });
        },
        padding: 10,
      }),
    ],
  });
  const comboboxOptions = useMemo(() => {
    return Array?.isArray(options)
      ? observe || onInputChange
        ? options?.filter(Boolean)
        : searchQuery && searchQuery?.length > 0
        ? options
            ?.filter((option) => {
              if (typeof option === "object") {
                return searchKeys
                  ? searchKeys?.filter((searchKey) =>
                      option[searchKey]
                        ?.toSting()
                        ?.toLowerCase()
                        ?.replace(/\s+/g, "")
                        ?.includes(
                          searchQuery.toLowerCase().replace(/\s+/g, "")
                        )
                    )
                  : option?.id
                      ?.toString()
                      ?.toLowerCase()
                      .replace(/\s+/g, "")
                      .includes(
                        searchQuery.toLowerCase().replace(/\s+/g, "")
                      ) ||
                      option?.name
                        .toLowerCase()
                        .replace(/\s+/g, "")
                        .includes(
                          searchQuery.toLowerCase().replace(/\s+/g, "")
                        );
              } else {
                return option
                  ?.toString()
                  ?.toLowerCase()
                  .replace(/\s+/g, "")
                  .includes(searchQuery.toLowerCase().replace(/\s+/g, ""));
              }
            })
            ?.filter(Boolean)
        : options
      : [];
  }, [options, observe, onInputChange, searchQuery, searchKeys]);

  const debounceSearch = useSearch(searchQuery || "");

  useEffect(() => {
    if (onInputChange) {
      onInputChange?.(debounceSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceSearch]);

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        onChange: (e) => {
          onChange?.(e?.target?.value);
        },
      }}
      defaultValue={defaultValue}
      shouldUnregister={shouldUnregister}
      render={({ field: { onChange, value, name }, fieldState: { error } }) => {
        const errorMessage = error?.message;

        const isValue = multiple
          ? value && Array.isArray(value) && value?.length > 0
          : value
          ? true
          : false;

        return (
          <_Combobox
            value={
              multiple
                ? value && Array.isArray(value) && value?.length > 0
                  ? value
                  : []
                : value ?? null
            }
            multiple={(multiple ?? false) as unknown as false}
            as={"div"}
            name={name}
            onChange={onChange}
            className={combineClassName(
              "w-full bg-white font-roboto",
              className
            )}
            disabled={disabled || readOnly}
            by={
              by
                ? (by as any)
                : comboboxOptions &&
                  comboboxOptions?.length > 0 &&
                  typeof comboboxOptions[0] === "object"
                ? "id"
                : undefined
            }
          >
            {({ open }) => {
              return (
                <Fragment>
                  <div
                    className={combineClassName(
                      "bg-inherit relative flex items-center justify-center gap-2 border rounded px-3 py-2.5 transition-all group/combobox",
                      !disabled && !readOnly
                        ? "border-outline-border has-[:focus]:border-primary-main hover:border-black"
                        : readOnly
                        ? "border-outline-border cursor-default"
                        : "",
                      disabled ? "cursor-not-allowed" : "",
                      errorMessage
                        ? "border-error-main has-[:focus]:border-error-main hover:border-error-main"
                        : "",
                      variant === "medium" ? "py-[15px]" : "py-[7px]",
                      classNameForParent
                        ? typeof classNameForParent === "string"
                          ? classNameForParent
                          : classNameForParent?.(value as any)
                        : ""
                    )}
                    ref={setReference}
                  >
                    {leadingIcon
                      ? typeof leadingIcon === "function"
                        ? leadingIcon(value)
                        : leadingIcon
                      : null}
                    <div className="flex-1 bg-inherit">
                      {multiple &&
                        value &&
                        Array.isArray(value) &&
                        value?.length > 0 && (
                          <ScrollArea
                            className="max-h-[100px] overflow-y-auto"
                            containerClassName=""
                          >
                            <div className={"flex flex-wrap gap-2"}>
                              {(
                                value as unknown as
                                  | (string | number | OptionObject)[]
                              )?.map((result) => {
                                return (
                                  <p
                                    key={
                                      typeof result === "object"
                                        ? result?.id
                                        : result
                                    }
                                    className={combineClassName(
                                      "text-xs font-normal flex items-center gap-2 px-2.5 text-primary-main py-1.5 border border-black/25 rounded-lg",
                                      classNameForMultipleValueItem?.(
                                        result as any
                                      )
                                    )}
                                  >
                                    <span className="text-primary-text line-clamp-2 break-all">
                                      {valueRenderString
                                        ? valueRenderString(
                                            result as unknown as PathValue<
                                              TFieldValues,
                                              Name
                                            >
                                          )
                                        : typeof result === "object"
                                        ? result?.name?.toString()
                                        : result?.toString()}{" "}
                                    </span>
                                    {disabled || readOnly ? null : (
                                      <Button
                                        className={combineClassName(
                                          "grid place-content-center size-4 min-w-4 min-h-4 text-action-active rounded-full hover:bg-action-hover cursor-pointer outline-none focus-visible:ring focus-visible:ring-primary-main",
                                          disabled || readOnly
                                            ? "invisible"
                                            : isValue
                                            ? "visible"
                                            : "invisible"
                                        )}
                                        onPress={() => {
                                          onChange(
                                            value?.filter((option) => {
                                              if (
                                                typeof option === "object" &&
                                                typeof result === "object"
                                              ) {
                                                return option?.id !== result.id;
                                              } else {
                                                return (
                                                  option.toString() !==
                                                  result?.toString()
                                                );
                                              }
                                            }) || []
                                          );
                                        }}
                                        isDisabled={disabled || readOnly}
                                      >
                                        <CancelIcon className="text-black/25" />
                                      </Button>
                                    )}
                                  </p>
                                );
                              })}
                              {!disabled && !readOnly ? (
                                <_Combobox.Input
                                  autoComplete="off"
                                  className={combineClassName(
                                    "focus:outline-none placeholder:text-secondary-text/25"
                                  )}
                                  onChange={(e) => {
                                    setSearchQuery(e?.target?.value || "");
                                    onInputChange?.(e?.target?.value || null);
                                  }}
                                  placeholder={placeholder || "Search..."}
                                  displayValue={() => ""}
                                  autoCorrect="on"
                                />
                              ) : null}
                            </div>
                            <ScrollBar className="border rounded" />
                          </ScrollArea>
                        )}
                      {multiple ? (
                        multiple &&
                        value &&
                        Array.isArray(value) &&
                        value?.length > 0 ? null : (
                          <_Combobox.Input
                            autoComplete="off"
                            className={combineClassName(
                              "peer bg-inherit w-full outline-none text-base text-primary-text placeholder-transparent focus:placeholder-secondary-text",
                              multiple && (disabled || readOnly)
                                ? "hidden"
                                : "",
                              disabled ? "text-disable-text" : ""
                            )}
                            onChange={(e) => {
                              setSearchQuery(e?.target?.value || "");
                              onInputChange?.(e?.target?.value || null);
                            }}
                            placeholder={placeholder || "Search..."}
                            displayValue={(
                              displayValue: string | number | OptionObject
                            ) =>
                              multiple
                                ? ""
                                : displayValue?.toString()?.trim()
                                ? typeof displayValue === "object"
                                  ? displayValue?.name?.toString()?.trim()
                                  : displayValue?.toString()?.trim()
                                : ""
                            }
                            autoCorrect="on"
                          />
                        )
                      ) : (
                        <_Combobox.Input
                          autoComplete="off"
                          className={combineClassName(
                            "peer bg-inherit w-full outline-none text-base text-primary-text placeholder-transparent focus:placeholder-secondary-text",
                            multiple && (disabled || readOnly) ? "hidden" : "",
                            disabled ? "text-disable-text" : ""
                          )}
                          onChange={(e) => {
                            setSearchQuery(e?.target?.value || "");
                            onInputChange?.(e?.target?.value || null);
                          }}
                          placeholder={placeholder || "Search..."}
                          displayValue={(
                            displayValue: string | number | OptionObject
                          ) =>
                            valueRenderString
                              ? valueRenderString(
                                  displayValue as unknown as PathValue<
                                    TFieldValues,
                                    Name
                                  >
                                )
                              : multiple
                              ? ""
                              : displayValue?.toString()?.trim()
                              ? typeof displayValue === "object"
                                ? displayValue?.name?.toString()?.trim()
                                : displayValue?.toString()?.trim()
                              : ""
                          }
                          autoCorrect="on"
                        />
                      )}
                      {label ? (
                        <_Combobox.Label
                          className={combineClassName(
                            "transition-all max-w-[80%] bg-inherit truncate absolute left-2  text-secondary-text text-base  px-1 duration-300 peer-focus:text-xs cursor-text",
                            readOnly ? "" : "",
                            disabled ? "cursor-default text-disable-text" : "",
                            errorMessage
                              ? "text-error-main peer-focus:text-error-main group-focus-within/combobox:text-error-main"
                              : "peer-focus:text-primary-main group-focus-within/combobox:text-primary-main",
                            variant === "medium"
                              ? "top-3.5 peer-focus:-top-2"
                              : "top-1.5 peer-focus:-top-2",
                            isValue ? "-top-2 text-xs" : "",
                            classNameForLabel
                              ? typeof classNameForLabel === "string"
                                ? classNameForLabel
                                : classNameForLabel?.(value as any)
                              : ""
                          )}
                        >
                          {label}
                        </_Combobox.Label>
                      ) : null}
                    </div>
                    <div className="flex justify-center items-center gap-2">
                      {canClear ? (
                        <Button
                          className={combineClassName(
                            "grid place-content-center size-6 min-w-6 min-h-6 text-action-active rounded-full hover:bg-action-hover cursor-pointer outline-none focus-visible:ring focus-visible:ring-primary-main",
                            disabled || readOnly
                              ? "invisible"
                              : isValue
                              ? "visible"
                              : "invisible"
                          )}
                          onPress={() => {
                            if (!disabled && !readOnly) {
                              onChange(null);
                            }
                          }}
                          isDisabled={disabled || readOnly}
                        >
                          <CloseIcon className="w-5 h-5" />
                        </Button>
                      ) : null}

                      <_Combobox.Button
                        className={combineClassName(
                          "size-6 min-w-6 min-h-6 text-action-active rounded-full outline-none transition-all duration-300",
                          open ? "rotate-180" : "rotate-0",
                          disabled || readOnly
                            ? ""
                            : "hover:bg-action-hover cursor-pointer focus:bg-action-hover"
                        )}
                      >
                        <DropdownIcon />
                      </_Combobox.Button>
                      {trailingIcon
                        ? typeof trailingIcon === "function"
                          ? trailingIcon(value)
                          : trailingIcon
                        : null}
                    </div>
                  </div>
                  <SupportTextMessage error={error} supportText={supportText} />
                  <FloatingPortal>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                      afterLeave={() => setSearchQuery("")}
                    >
                      <_Combobox.Options as={Fragment}>
                        <ScrollArea
                          style={floatingStyles}
                          ref={setFloating}
                          className={
                            "shadow-elevation rounded py-2 bg-white overflow-y-auto max-h-[220px]"
                          }
                        >
                          {searchQuery?.trim()?.length > 0 &&
                            allowCustomValue && (
                              <_Combobox.Option
                                value={
                                  allowCustomValueAsString
                                    ? searchQuery
                                    : {
                                        id: `${searchQuery}-${uuid()}`,
                                        name: searchQuery,
                                      }
                                }
                                as={"p"}
                                className={({ active, selected }) =>
                                  renderedOption
                                    ? ""
                                    : combineClassName(
                                        "px-4 py-1.5 text-base font-normal text-primary-text cursor-pointer truncate",
                                        selected ? "bg-primary-shade" : "",
                                        active ? "bg-action-hover" : ""
                                      )
                                }
                                style={{
                                  maxWidth: `${
                                    reference?.current &&
                                    reference?.current?.getBoundingClientRect()
                                      ?.width > 220
                                      ? reference?.current?.getBoundingClientRect()
                                          ?.width
                                      : 220
                                  }px`,
                                }}
                              >
                                {searchQuery}
                              </_Combobox.Option>
                            )}
                          {allowCustomValue &&
                          comboboxOptions?.length === 0 &&
                          (searchQuery?.trim()?.length == 0 ||
                            searchQuery === null ||
                            searchQuery === undefined) ? (
                            <div className="w-full text-sm text-secondary px-4 py-1.5">
                              Nothing found.
                            </div>
                          ) : null}

                          {!allowCustomValue &&
                          !loading &&
                          comboboxOptions?.length === 0 ? (
                            <div className="w-full text-sm text-secondary px-4 py-1.5">
                              Nothing found.
                            </div>
                          ) : (
                            comboboxOptions.map((comboBoxOption, index) => {
                              const option = comboBoxOption as unknown as
                                | OptionObject
                                | string
                                | number;

                              return (
                                <_Combobox.Option
                                  key={
                                    typeof option === "object"
                                      ? `${option?.id}-${index}`
                                      : `${option}-${index}`
                                  }
                                  value={option}
                                  as={"p"}
                                  className={({ active, selected }) =>
                                    renderedOption
                                      ? ""
                                      : combineClassName(
                                          "px-4 py-1.5 text-base font-normal text-primary-text cursor-pointer truncate",
                                          selected ? "bg-primary-shade" : "",
                                          active ? "bg-action-hover" : ""
                                        )
                                  }
                                  style={{
                                    maxWidth: `${
                                      reference?.current &&
                                      reference?.current?.getBoundingClientRect()
                                        ?.width > 220
                                        ? reference?.current?.getBoundingClientRect()
                                            ?.width
                                        : 220
                                    }px`,
                                  }}
                                >
                                  {({ active, disabled, selected }) => {
                                    return renderedOption
                                      ? (renderedOption(
                                          comboBoxOption as unknown as any,
                                          {
                                            active,
                                            disabled,
                                            selected,
                                          }
                                        ) as any)
                                      : optionRenderString
                                      ? optionRenderString(
                                          option as unknown as PathValue<
                                            TFieldValues,
                                            Name
                                          >
                                        )
                                      : typeof option === "object"
                                      ? option?.name?.toString()
                                      : option?.toString();
                                  }}
                                </_Combobox.Option>
                              );
                            })
                          )}
                          {loading && (
                            <div className="space-y-2 px-2">
                              {Array.from({ length: 3 })?.map(
                                (_value, index) => (
                                  <div key={index} className="w-full h-[36px]">
                                    <span className="block bg-gray-300 w-full h-full rounded animate-pulse" />
                                  </div>
                                )
                              )}
                            </div>
                          )}
                          {observe && !loading && (
                            <div
                              className="w-full h-0 invisible"
                              ref={(ref) => observe(ref)}
                            />
                          )}
                        </ScrollArea>
                      </_Combobox.Options>
                    </Transition>
                  </FloatingPortal>
                </Fragment>
              );
            }}
          </_Combobox>
        );
      }}
    />
  );
};

export default Combobox;
