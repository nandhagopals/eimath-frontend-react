import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import {
  FloatingPortal,
  autoUpdate,
  flip,
  hide,
  offset,
  size,
  useFloating,
} from "@floating-ui/react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { combineClassName, rowsPerPageArray } from "global/helpers";
import ArrowDropdownIcon from "global/assets/images/arrow-drop-down-filled.svg?react";
import { SetState } from "global/types";

interface Props<TFieldValues extends FieldValues = FieldValues> {
  onPageSizeChange: (page: number) => void;
  disabled: boolean;
  control: Control<TFieldValues>;
  setCurrentPage: SetState<number>;
}

const FooterRowPerPage = <TFieldValues extends FieldValues = FieldValues>({
  onPageSizeChange,
  disabled,
  control,
  setCurrentPage,
}: Props<TFieldValues>) => {
  const {
    refs: { setFloating, setReference },
    floatingStyles,
  } = useFloating<HTMLElement>({
    placement: "bottom-end",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      flip({ padding: 10 }),
      size({
        apply({ rects, elements, availableHeight }) {
          Object.assign(elements?.floating?.style, {
            maxHeight: `${availableHeight}px`,
            minWidth: `${rects.reference.width || 100}px`,
          });
        },
        padding: 10,
      }),
      hide({
        strategy: "referenceHidden",
      }),
    ],
  });
  return (
    <Controller
      name={"pageSize" as unknown as Path<TFieldValues>}
      control={control}
      rules={{
        onChange: (e) => {
          onPageSizeChange(e?.target?.value);
          setCurrentPage(1);
        },
      }}
      render={({ field: { value, onChange } }) => {
        return (
          <Listbox
            value={value || 10}
            onChange={onChange}
            as={"div"}
            className={combineClassName("flex gap-3 items-center")}
            disabled={disabled}
          >
            <Listbox.Button
              ref={setReference}
              className={({ disabled }) =>
                combineClassName(
                  "flex items-center focus:outline-none focus-visible:bg-action-hover",
                  disabled ? "" : "cursor-pointer"
                )
              }
            >
              <Listbox.Label
                className={() =>
                  combineClassName(
                    "text-xs text-secondary-text text-opacity-60 font-normal leading-5",
                    disabled ? "" : "cursor-pointer"
                  )
                }
              >
                Rows per page:
              </Listbox.Label>
              <p className="text-primary-text text-opacity-85 text-xs font-normal ml-2">
                {value || 10}
              </p>
              <ArrowDropdownIcon
                className="h-5 w-5 text-action-active"
                aria-hidden="true"
              />
            </Listbox.Button>
            <FloatingPortal>
              <Transition as={Fragment}>
                <Listbox.Options
                  ref={setFloating}
                  style={{
                    ...floatingStyles,
                    overflowY: "auto",
                  }}
                  className={combineClassName(
                    "w-min rounded bg-white shadow-elevation min-w-24 focus:outline-none"
                  )}
                >
                  {rowsPerPageArray?.map((rowPerPage) => (
                    <Listbox.Option
                      key={rowPerPage}
                      className={({ active, selected }) =>
                        combineClassName(
                          "flex cursor-pointer p-1 items-center justify-between text-primary-text focus:outline-none",
                          active ? "bg-action-hover" : "",
                          selected ? "bg-primary-shade" : ""
                        )
                      }
                      value={rowPerPage}
                    >
                      {rowPerPage}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </FloatingPortal>
          </Listbox>
        );
      }}
    />
  );
};

export { FooterRowPerPage };
