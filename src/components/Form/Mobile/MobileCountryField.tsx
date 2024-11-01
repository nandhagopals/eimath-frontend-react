import { FC, Fragment } from "react";
import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  size,
  useFloating,
} from "@floating-ui/react";
import { Listbox, Transition } from "@headlessui/react";
import { useQuery, useReactiveVar } from "@apollo/client";

import { MobileCountryFieldProps } from "components/Form/Mobile/types";
import { SupportTextMessage } from "components/Form/SupportTextMessage";

import DropdownIcon from "global/assets/images/arrow-drop-down-filled.svg?react";
import { combineClassName } from "global/helpers";
import { paginationDefaultCount } from "global/cache";
import { useInView } from "global/hook";

import { FILTER_COUNTRIES } from "modules/Settings/Country";

const fieldArgs = {
  isCountryIsdCodeNeed: true,
  isCountryStatusNeed: true,
};

const MobileCountryField: FC<MobileCountryFieldProps> = ({
  error,
  onChange,
  value,
  className,
  disabled,
  label,
  readOnly,
  labelClassName,
  variant,
  name,
  supportText,
}) => {
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { data, loading, fetchMore } = useQuery(FILTER_COUNTRIES, {
    variables: {
      pagination: { size: defaultPageSize },
      ...fieldArgs,
      filter: {
        status: {
          inArray: ["Active"],
        },
      },
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const countries =
    data?.filterCountries?.edges?.map((edge) => ({
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      id: edge?.node?.id!,
      name: edge?.node?.name || "N/A",
      isdCode: edge?.node?.isdCode || "N/A",
    })) || [];

  const {
    refs: { setFloating, setReference },
    floatingStyles,
  } = useFloating({
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      flip({
        fallbackPlacements: ["top"],
      }),
      size({
        apply({ elements }) {
          Object.assign(elements.floating.style, {
            minWidth: `${220}px`,
            maxWidth: `${220}px`,
          });
        },
        padding: 10,
      }),
    ],
  });

  const { observe } = useInView({
    onEnter: () => {
      if (
        !loading &&
        data?.filterCountries?.pageInfo?.hasNextPage &&
        data?.filterCountries?.pageInfo?.endCursor &&
        !disabled &&
        !readOnly
      ) {
        fetchMore({
          variables: {
            pagination: {
              after: data?.filterCountries?.pageInfo?.endCursor,
              size: defaultPageSize,
            },
            ...fieldArgs,
          },
          updateQuery: (prev, { fetchMoreResult: { filterCountries } }) => {
            if (!filterCountries) return prev;
            return {
              filterCountries:
                filterCountries?.edges &&
                filterCountries?.edges?.length > 0 &&
                prev?.filterCountries
                  ? prev?.filterCountries?.edges &&
                    prev?.filterCountries?.edges?.length > 0
                    ? {
                        edges: [
                          ...prev.filterCountries.edges,
                          ...filterCountries.edges,
                        ],
                        pageInfo: filterCountries?.pageInfo,
                      }
                    : {
                        edges: filterCountries?.edges,
                        pageInfo: filterCountries?.pageInfo,
                      }
                  : prev.filterCountries,
            };
          },
        });
      }
    },
  });

  return (
    <Listbox
      value={value?.country ?? null}
      onChange={(country) => {
        onChange({
          ...value,
          country,
        });
      }}
      disabled={readOnly || disabled}
    >
      {({ value, open }) => {
        return (
          <Fragment>
            <div>
              <Listbox.Button
                ref={setReference}
                as={"div"}
                className={combineClassName(
                  "bg-white relative transition-colors duration-300 border rounded border-outline-border  cursor-pointer flex items-center p-3 group",
                  open ? "border-primary-main hover:border-primary-main" : "",
                  variant === "medium" ? "h-14" : "h-10",
                  error?.message
                    ? "border-error-main hover:border-error-main focus-within:border-error-main"
                    : " focus-within:border-primary-main",
                  disabled
                    ? "cursor-not-allowed border-disable-text/15"
                    : readOnly
                    ? "cursor-default"
                    : "cursor-pointer hover:border-black",
                  className
                )}
              >
                {label ? (
                  <Listbox.Button
                    as={"label"}
                    htmlFor={`${name}-country`}
                    className={combineClassName(
                      "max-w-[60%] truncate absolute  px-1 text-secondary-text text-base top-1/2 left-2 [transform:translateY(-50%)] transition-all duration-300 bg-inherit cursor-pointer group-focus-within:top-0 group-focus-within:text-xs  group-focus-within:max-w-[80%]",
                      open ? "text-xs top-0 text-primary-main max-w-[80%]" : "",
                      value ? "text-xs top-0" : "",
                      error?.message
                        ? "text-error-main group-focus-within:text-error-main"
                        : "group-focus-within:text-primary-main",
                      disabled
                        ? "cursor-not-allowed select-none text-disable-text/15"
                        : readOnly
                        ? "cursor-default"
                        : "cursor-pointer",
                      labelClassName
                    )}
                  >
                    {label}
                  </Listbox.Button>
                ) : null}
                <p
                  className={combineClassName(
                    "w-full text-start outline-none max-w-[inherit] truncate"
                  )}
                >
                  {value?.isdCode ?? ""}
                </p>
                <div className="flex justify-center items-center gap-2">
                  <Listbox.Button
                    as={"button"}
                    className={combineClassName(
                      "size-6 min-w-6 min-h-6 text-action-active rounded-full outline-none focus:ring focus:ring-primary-main focus-visible:ring focus-visible:ring-primary-main transition-all duration-300",
                      open ? "rotate-180" : "rotate-0",
                      disabled
                        ? "text-disable-text/15 cursor-not-allowed"
                        : readOnly
                        ? "cursor-default"
                        : "hover:bg-action-hover cursor-pointer"
                    )}
                  >
                    <DropdownIcon />
                  </Listbox.Button>
                </div>
              </Listbox.Button>
              <SupportTextMessage
                error={error}
                supportText={{
                  className: combineClassName(
                    "truncate",
                    supportText?.className
                  ),
                  text: supportText?.text,
                }}
              />
            </div>
            <FloatingPortal>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options
                  style={floatingStyles}
                  ref={setFloating}
                  className={
                    "shadow-elevation rounded py-2 bg-white overflow-y-auto max-h-[220px] outline-none focus:outline-none"
                  }
                >
                  {!loading && countries?.length === 0 ? (
                    <div className="w-full text-sm text-secondary py-1 px-4">
                      Nothing found
                    </div>
                  ) : (
                    countries?.map((option, index) => {
                      return (
                        <Listbox.Option
                          key={`${option?.id}-${index}`}
                          value={option}
                          as={"div"}
                          className={({ active, selected }) =>
                            combineClassName(
                              "px-4 py-1.5 text-base font-normal text-primary-text cursor-pointer truncate",
                              selected ? "bg-primary-shade" : "",
                              active ? "bg-action-hover" : ""
                            )
                          }
                          style={{
                            maxWidth: `${220}px`,
                          }}
                        >
                          {`${option?.isdCode} (${option?.name || "N/A"})`}
                        </Listbox.Option>
                      );
                    })
                  )}

                  {loading ? (
                    <div className="grid gap-1 px-2">
                      {Array.from({ length: defaultPageSize })?.map(
                        (_value, index) => (
                          <div key={index} className="w-full h-[36px]">
                            <span className="block bg-gray-300 w-full h-full rounded animate-pulse" />
                          </div>
                        )
                      )}
                    </div>
                  ) : null}

                  {observe && !loading && (
                    <div
                      className="w-full h-0 invisible"
                      ref={(ref) => observe(ref)}
                    />
                  )}
                </Listbox.Options>
              </Transition>
            </FloatingPortal>
          </Fragment>
        );
      }}
    </Listbox>
  );
};

export default MobileCountryField;
