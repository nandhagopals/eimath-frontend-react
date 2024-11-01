/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useMemo, useState } from "react";
import { Controller, FieldPath, FieldValues, PathValue } from "react-hook-form";
import { Button } from "react-aria-components";
import { Transition, Listbox } from "@headlessui/react";
import { autoUpdate, flip, size, offset } from "@floating-ui/react";
import { useFloating } from "@floating-ui/react-dom";

import { SelectProps } from "components/Form/Select";
import { SupportTextMessage, OptionObject } from "components/Form";
import { ScrollArea, ScrollBar } from "components/ScrollArea";

import { combineClassName } from "global/helpers";
import CancelIcon from "global/assets/images/cancel-filled.svg?react";
import CloseIcon from "global/assets/images/close-filled.svg?react";
import DropdownIcon from "global/assets/images/arrow-drop-down-filled.svg?react";

const Select = <
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
  canClear = false,
  defaultValue,
  optionRenderString,
  valueRenderString,
}: //   searchInput = false,
SelectProps<TFieldValues, Name>) => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    refs: { setReference, setFloating, reference },
    floatingStyles,
  } = useFloating({
    placement: "bottom",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      flip({
        fallbackPlacements: ["top"],
      }),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            minWidth: `${rects?.reference?.width || 220}px`,
            maxWidth: `${rects?.reference?.width || 220}px`,
          });
        },
        padding: 10,
      }),
    ],
  });
  const listboxOptions = useMemo(() => {
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

  //   const debouncedFunction = debounce((input: string | null) => {
  //     setSearchQuery("");
  //     onInputChange?.(input);
  //   }, 500);

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

        const listBoxValue = value as unknown as
          | string
          | number
          | OptionObject
          | (string | number | OptionObject)[]
          | null
          | undefined;

        const selectValue = loading
          ? "Loading..."
          : multiple || (listBoxValue && Array.isArray(listBoxValue))
          ? placeholder ?? "Select"
          : listBoxValue
          ? valueRenderString
            ? valueRenderString(
                listBoxValue as unknown as PathValue<TFieldValues, Name>
              )
            : typeof listBoxValue === "object"
            ? listBoxValue?.name ?? placeholder ?? "Select"
            : listBoxValue?.toString() ?? placeholder ?? "Select"
          : placeholder ?? "Select";

        return (
          <Listbox
            value={
              multiple
                ? value && Array.isArray(value) && value?.length > 0
                  ? value
                  : []
                : value ?? null
            }
            multiple={multiple}
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
                : listboxOptions &&
                  listboxOptions?.length > 0 &&
                  typeof listboxOptions[0] === "object"
                ? "id"
                : undefined
            }
          >
            {({ open }) => {
              return (
                <Fragment>
                  <div
                    className={combineClassName(
                      "bg-inherit relative flex items-center justify-center gap-2 border rounded px-3 py-2.5 transition-all group/select",
                      !disabled && !readOnly
                        ? "border-outline-border has-[:focus]:border-primary-main hover:border-black"
                        : readOnly
                        ? "border-outline-border"
                        : "",
                      disabled ? "cursor-not-allowed" : "",
                      errorMessage
                        ? "border-error-main has-[:focus]:border-error-main hover:border-error-main"
                        : "",
                      variant === "medium" ? "py-[15px]" : "py-[7px]"
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
                                    className="text-xs font-normal flex gap-2 px-2.5 text-primary-main py-1.5 border border-black/25 rounded-lg"
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
                                        : result?.toString()}
                                    </span>
                                    {(disabled || readOnly) &&
                                    !canClear ? null : (
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
                            </div>
                            <ScrollBar className="border rounded" />
                          </ScrollArea>
                        )}
                      <Listbox.Button
                        className={combineClassName(
                          "peer w-full whitespace-nowrap outline-none text-base text-primary-text placeholder-transparent focus:placeholder-secondary-text text-start break-all max-w-[inherit]",
                          multiple && (disabled || readOnly) ? "hidden" : "",
                          disabled ? "text-disable-text" : "",
                          multiple
                            ? isValue
                              ? "pt-2"
                              : "text-transparent truncate"
                            : isValue
                            ? ""
                            : "text-transparent truncate"
                        )}
                        style={{
                          maxWidth: multiple
                            ? isValue
                              ? undefined
                              : `${
                                  (reference?.current?.getBoundingClientRect()
                                    ?.width || 10) - 100
                                }px`
                            : isValue
                            ? undefined
                            : `${
                                (reference?.current?.getBoundingClientRect()
                                  ?.width || 10) - 100
                              }px`,
                        }}
                      >
                        {selectValue}
                      </Listbox.Button>
                      {label ? (
                        <Listbox.Button
                          as="label"
                          className={combineClassName(
                            "transition-all max-w-[80%] bg-inherit truncate absolute left-2 text-secondary-text text-base  px-1 duration-300 cursor-text",
                            disabled
                              ? "cursor-not-allowed text-disable-text"
                              : readOnly
                              ? "cursor-default"
                              : "cursor-pointer",
                            errorMessage
                              ? "text-error-main peer-focus:text-error-main group-focus-within/select:text-error-main"
                              : "peer-focus:text-primary-main group-focus-within/select:text-primary-main",
                            variant === "medium" ? "top-3.5" : "top-1.5",
                            isValue ? "-top-2.5 text-xs" : ""
                          )}
                        >
                          {label}
                        </Listbox.Button>
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

                      <Listbox.Button
                        className={combineClassName(
                          "size-6 min-w-6 min-h-6 text-action-active rounded-full outline-none focus:bg-action-hover focus-visible:bg-action-hover transition-all duration-300",
                          open ? "rotate-180" : "rotate-0",
                          disabled || readOnly
                            ? ""
                            : "hover:bg-action-hover cursor-pointer"
                        )}
                      >
                        <DropdownIcon />
                      </Listbox.Button>
                      {trailingIcon
                        ? typeof trailingIcon === "function"
                          ? trailingIcon(value)
                          : trailingIcon
                        : null}
                    </div>
                  </div>
                  <SupportTextMessage error={error} supportText={supportText} />

                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => {
                      if (onInputChange) {
                        setSearchQuery("");
                      }
                    }}
                  >
                    <Listbox.Options
                      as={"ul"}
                      style={floatingStyles}
                      ref={setFloating}
                      className={
                        "absolute z-10 shadow-elevation rounded py-2 bg-white overflow-y-auto max-h-[220px]"
                      }
                    >
                      {/* {searchInput && (
                            <SearchField
                              aria-label="Select search"
                              className={combineClassName(
                                "flex gap-1 items-center px-3 py-0.5 min-w-[200px] bg-primary-contrast relative"
                              )}
                              onChange={debouncedFunction}
                            >
                              {({ state }) => (
                                <Fragment>
                                  <Input
                                    id={"select-search"}
                                    onBlur={() => {
                                      state?.setValue(state?.value?.trim());
                                    }}
                                    type="text"
                                    className={() =>
                                      combineClassName(
                                        "text-base focus:outline-none text-primary-text placeholder-primary-text/30 border focus:border-primary-main rounded w-full px-3 py-1.5 pr-7"
                                      )
                                    }
                                    placeholder="Search..."
                                  />
                                  <Button
                                    className={() =>
                                      combineClassName(
                                        "w-8 h-8 rounded-full hover:bg-action-hover grid place-items-center text-action-active absolute right-3",
                                        state?.value?.length > 0
                                          ? "visible"
                                          : "invisible"
                                      )
                                    }
                                  >
                                    <CloseIcon />
                                  </Button>
                                </Fragment>
                              )}
                            </SearchField>
                          )} */}
                      {!loading && listboxOptions?.length === 0 ? (
                        <div className="w-full px-4 text-sm text-secondary py-1">
                          Nothing found
                        </div>
                      ) : (
                        listboxOptions.map((comboBoxOption, index) => {
                          const option = comboBoxOption as unknown as
                            | OptionObject
                            | string
                            | number;
                          return (
                            <Listbox.Option
                              key={
                                typeof option === "object"
                                  ? `${option?.id}-${index}`
                                  : `${option}-${index}`
                              }
                              value={option}
                              as={"div"}
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
                                  reference?.current?.getBoundingClientRect()
                                    ?.width
                                }px`,
                              }}
                            >
                              {({ active, disabled, selected }) => {
                                return renderedOption
                                  ? (renderedOption(comboBoxOption, {
                                      active,
                                      disabled,
                                      selected,
                                    }) as any)
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
                            </Listbox.Option>
                          );
                        })
                      )}

                      {loading && (
                        <div className="space-y-2 px-2">
                          {Array.from({ length: 3 })?.map((_value, index) => (
                            <div key={index} className="w-full h-[36px]">
                              <span className="block bg-gray-300 w-full h-full rounded animate-pulse" />
                            </div>
                          ))}
                        </div>
                      )}
                      {observe && !loading && (
                        <div
                          className="w-full h-0 invisible"
                          ref={(ref) => observe(ref)}
                        />
                      )}
                    </Listbox.Options>
                  </Transition>
                </Fragment>
              );
            }}
          </Listbox>
        );
      }}
    />
  );
};

export default Select;
