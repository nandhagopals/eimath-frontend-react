import { useQuery, useReactiveVar } from "@apollo/client";
import { useMemo } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import { Combobox, ComboboxProps } from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { useInView } from "global/hook";
import { messageHelper } from "global/helpers";

import {
  FILTER_PAYMENT_VOUCHERS,
  PaymentVoucherFieldArgs,
  PaymentVoucherFilterInput,
} from "modules/PaymentVouchers";

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
> & { args?: { filter?: PaymentVoucherFilterInput } & PaymentVoucherFieldArgs };

const PaymentVoucherField = <
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
  canClear,
  defaultValue,
  optionRenderString,
  placement,
  valueRenderString,
  allowCustomValue,
  allowCustomValueAsString,
}: Props<TFieldValues, Name>) => {
  const defaultPageSize = useReactiveVar(paginationDefaultCount);
  const { data, loading, error, fetchMore } = useQuery(
    FILTER_PAYMENT_VOUCHERS,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        pagination: {
          size: defaultPageSize,
        },
        ...args,
      },
      notifyOnNetworkStatusChange: true,
      skip: disabled || readOnly ? true : false,
    }
  );

  const { observe } = useInView({
    onEnter: () => {
      if (
        !loading &&
        data?.filterPaymentVouchers?.pageInfo?.hasNextPage &&
        data?.filterPaymentVouchers?.pageInfo?.endCursor &&
        !disabled &&
        !readOnly
      ) {
        fetchMore({
          variables: {
            pagination: {
              after: data?.filterPaymentVouchers?.pageInfo?.endCursor,
              size: defaultPageSize,
            },
            ...args,
          },
          updateQuery: (
            prev,
            { fetchMoreResult: { filterPaymentVouchers } }
          ) => {
            if (!filterPaymentVouchers) return prev;
            return {
              filterPaymentVouchers:
                filterPaymentVouchers?.edges &&
                filterPaymentVouchers?.edges?.length > 0 &&
                prev?.filterPaymentVouchers
                  ? prev?.filterPaymentVouchers?.edges &&
                    prev?.filterPaymentVouchers?.edges?.length > 0
                    ? {
                        edges: [
                          ...prev.filterPaymentVouchers.edges,
                          ...filterPaymentVouchers.edges,
                        ],
                        pageInfo: filterPaymentVouchers?.pageInfo,
                      }
                    : {
                        edges: filterPaymentVouchers?.edges,
                        pageInfo: filterPaymentVouchers?.pageInfo,
                      }
                  : prev.filterPaymentVouchers,
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
      : data?.filterPaymentVouchers?.edges &&
        data?.filterPaymentVouchers?.edges?.length > 0
      ? data?.filterPaymentVouchers?.edges
          ?.map((edge) => {
            if (edge?.node?.id && edge?.node?.payee) {
              return { id: edge?.node?.id, name: edge?.node?.payee };
            } else {
              return null;
            }
          })
          .filter(Boolean)
      : [];
  }, [data?.filterPaymentVouchers?.edges, error?.message]);

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
            updateQuery: (
              _,
              { fetchMoreResult: { filterPaymentVouchers } }
            ) => {
              return {
                filterPaymentVouchers,
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
      placement={placement}
      valueRenderString={valueRenderString}
      canClear={canClear}
      allowCustomValue={allowCustomValue}
      allowCustomValueAsString={allowCustomValueAsString}
    />
  );
};

export default PaymentVoucherField;
