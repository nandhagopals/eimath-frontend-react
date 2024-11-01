import { useQuery, useReactiveVar } from "@apollo/client";
import { useMemo } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import { Combobox, ComboboxProps } from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { useInView } from "global/hook";
import { messageHelper } from "global/helpers";

import {
  FILTER_COUNTRIES,
  CountryFieldArgs,
  CountryFilterInput,
} from "modules/Settings/Country";

type Props<
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = Omit<
  ComboboxProps<TFieldValues, Name>,
  | "options"
  | "loading"
  | "onInputChange"
  | "searchKeys"
  | "validate"
  | "value"
  | "observe"
> & { args?: { filter?: CountryFilterInput } & CountryFieldArgs };

const CountryField = <
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  className,
  disabled,
  label,
  multiple,
  onChange,
  placeholder,
  shouldUnregister,
  by,
  leadingIcon,
  readOnly,
  supportText,
  trailingIcon,
  variant,
  args,
  renderedOption,
  defaultValue,
  optionRenderString,
  valueRenderString,
  canClear,
  placement,
  classNameForMultipleValueItem,
  classNameForParent,
  classNameForLabel,
  allowCustomValue,
  allowCustomValueAsString,
}: Props<TFieldValues, Name>) => {
  const defaultPageSize = useReactiveVar(paginationDefaultCount);
  const { data, loading, error, fetchMore } = useQuery(FILTER_COUNTRIES, {
    fetchPolicy: "cache-and-network",
    variables: {
      pagination: {
        size: defaultPageSize,
      },
      ...args,
    },
    notifyOnNetworkStatusChange: true,
    skip: disabled || readOnly ? true : false,
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
            ...args,
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
        }).catch((err) => {
          toastNotification(messageHelper(err));
        });
      }
    },
  });

  const options = useMemo(() => {
    return error?.message
      ? []
      : data?.filterCountries?.edges && data?.filterCountries?.edges?.length > 0
      ? data?.filterCountries?.edges
          ?.map((edges) => {
            if (edges?.node?.id && edges?.node?.name) {
              return edges?.node;
            } else {
              return null;
            }
          })
          .filter(Boolean)
      : [];
  }, [data?.filterCountries?.edges, error?.message]);

  return (
    <Combobox
      control={control}
      name={name}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options={options as any}
      className={className}
      disabled={disabled}
      label={label}
      loading={loading}
      multiple={multiple}
      observe={observe}
      onChange={onChange}
      onInputChange={(value) => {
        if (!loading && !disabled && !readOnly)
          fetchMore({
            variables: {
              pagination: {
                size: defaultPageSize,
              },
              globalSearch: value || null,
              ...args,
            },
            updateQuery: (_, { fetchMoreResult: { filterCountries } }) => {
              return {
                filterCountries,
              };
            },
          }).catch((err) => {
            toastNotification(messageHelper(err));
          });
      }}
      placeholder={placeholder}
      shouldUnregister={shouldUnregister}
      by={by}
      leadingIcon={leadingIcon}
      readOnly={readOnly}
      renderedOption={renderedOption}
      supportText={supportText}
      trailingIcon={trailingIcon}
      variant={variant}
      defaultValue={defaultValue}
      optionRenderString={optionRenderString}
      valueRenderString={valueRenderString}
      canClear={canClear}
      placement={placement}
      classNameForMultipleValueItem={classNameForMultipleValueItem}
      classNameForParent={classNameForParent}
      classNameForLabel={classNameForLabel}
      allowCustomValue={allowCustomValue}
      allowCustomValueAsString={allowCustomValueAsString}
    />
  );
};

export default CountryField;
