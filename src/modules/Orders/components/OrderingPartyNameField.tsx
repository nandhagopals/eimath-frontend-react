import { useQuery, useReactiveVar } from "@apollo/client";
import { useMemo } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import { Combobox, ComboboxProps } from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { useInView } from "global/hook";
import { messageHelper, notEmpty } from "global/helpers";

import { FILTER_ORDERS } from "modules/Orders";

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
  | "allowCustomValueAsString"
  | "allowCustomValue"
>;
const OrderingPartyNameField = <
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
  renderedOption,
  defaultValue,
  optionRenderString,
  valueRenderString,
  canClear,
  placement,
}: Props<TFieldValues, Name>) => {
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { data, loading, error, fetchMore } = useQuery(FILTER_ORDERS, {
    fetchPolicy: "cache-and-network",
    variables: {
      pagination: {
        size: defaultPageSize,
      },
      isOrderOrderingPartyNameNeed: true,
    },
    notifyOnNetworkStatusChange: true,
    skip: disabled || readOnly ? true : false,
  });

  const { observe } = useInView({
    onEnter: () => {
      if (
        !loading &&
        data?.filterOrders?.pageInfo?.hasNextPage &&
        data?.filterOrders?.pageInfo?.endCursor &&
        !disabled &&
        !readOnly
      ) {
        fetchMore({
          variables: {
            pagination: {
              after: data?.filterOrders?.pageInfo?.endCursor,
              size: defaultPageSize,
            },
            isOrderOrderingPartyNameNeed: true,
          },
          updateQuery: (prev, { fetchMoreResult: { filterOrders } }) => {
            if (!filterOrders) return prev;
            return {
              filterOrders:
                filterOrders?.edges &&
                filterOrders?.edges?.length > 0 &&
                prev?.filterOrders
                  ? prev?.filterOrders?.edges &&
                    prev?.filterOrders?.edges?.length > 0
                    ? {
                        edges: [
                          ...prev.filterOrders.edges,
                          ...filterOrders.edges,
                        ],
                        pageInfo: filterOrders?.pageInfo,
                      }
                    : {
                        edges: filterOrders?.edges,
                        pageInfo: filterOrders?.pageInfo,
                      }
                  : prev.filterOrders,
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
      : data?.filterOrders?.edges && data?.filterOrders?.edges?.length > 0
      ? data?.filterOrders?.edges
          ?.map((edges) => {
            if (edges?.node?.orderingPartyName) {
              return edges?.node?.orderingPartyName;
            } else {
              return null;
            }
          })
          .filter(notEmpty)
      : [];
  }, [data?.filterOrders?.edges, error?.message]);

  return (
    <Combobox
      control={control}
      name={name}
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
              isOrderOrderingPartyNameNeed: true,
            },
            updateQuery: (_, { fetchMoreResult: { filterOrders } }) => {
              return {
                filterOrders,
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
      allowCustomValue
      allowCustomValueAsString
    />
  );
};

export { OrderingPartyNameField };
