import { useMemo } from "react";
import { useQuery, useReactiveVar } from "@apollo/client";
import type { FieldPath, FieldValues } from "react-hook-form";

import { Combobox, ComboboxProps } from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { useInView } from "global/hook";
import { messageHelper, notEmpty } from "global/helpers";

import {
  FILTER_MASTER_FRANCHISEE_INFORMATION,
  FilterMasterFranchiseeInformationArgs,
} from "modules/MasterFranchisee";

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
  | "by"
  | "allowCustomValueAsString"
> & {
  isTermNeed?: boolean;
  args?: Omit<
    FilterMasterFranchiseeInformationArgs,
    | "isMasterFranchiseeMasterFranchiseeProductNeed"
    | "isMasterFranchiseeMasterFranchiseeWorkBookNeed"
    | "isMasterFranchiseeMasterFranchiseeEducationalTermNeed"
  >;
};

const MasterFranchiseeItemField = <
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
  allowCustomValue = true,
  isTermNeed = true,
  args,
}: Props<TFieldValues, Name>) => {
  const defaultPageSize = useReactiveVar(paginationDefaultCount);
  const { data, loading, error, fetchMore } = useQuery(
    FILTER_MASTER_FRANCHISEE_INFORMATION,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        pagination: {
          size: defaultPageSize,
        },
        isMasterFranchiseeMasterFranchiseeProductNeed: true,
        isMasterFranchiseeMasterFranchiseeWorkBookNeed: true,
        isMasterFranchiseeMasterFranchiseeEducationalTermNeed: isTermNeed,
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
        data?.filterMasterFranchiseeInformation?.pageInfo?.hasNextPage &&
        data?.filterMasterFranchiseeInformation?.pageInfo?.endCursor &&
        !disabled &&
        !readOnly
      ) {
        fetchMore({
          variables: {
            pagination: {
              after:
                data?.filterMasterFranchiseeInformation?.pageInfo?.endCursor,
              size: defaultPageSize,
            },
            isMasterFranchiseeMasterFranchiseeProductNeed: true,
            isMasterFranchiseeMasterFranchiseeWorkBookNeed: true,
            isMasterFranchiseeMasterFranchiseeEducationalTermNeed: isTermNeed,
            ...args,
          },
          updateQuery: (
            prev,
            { fetchMoreResult: { filterMasterFranchiseeInformation } }
          ) => {
            if (!filterMasterFranchiseeInformation) return prev;
            return {
              filterMasterFranchiseeInformation:
                filterMasterFranchiseeInformation?.edges &&
                filterMasterFranchiseeInformation?.edges?.length > 0 &&
                prev?.filterMasterFranchiseeInformation
                  ? prev?.filterMasterFranchiseeInformation?.edges &&
                    prev?.filterMasterFranchiseeInformation?.edges?.length > 0
                    ? {
                        edges: [
                          ...prev.filterMasterFranchiseeInformation.edges,
                          ...filterMasterFranchiseeInformation.edges,
                        ],
                        pageInfo: filterMasterFranchiseeInformation?.pageInfo,
                      }
                    : {
                        edges: filterMasterFranchiseeInformation?.edges,
                        pageInfo: filterMasterFranchiseeInformation?.pageInfo,
                      }
                  : prev.filterMasterFranchiseeInformation,
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
      : data?.filterMasterFranchiseeInformation?.edges &&
        data?.filterMasterFranchiseeInformation?.edges?.length > 0
      ? data?.filterMasterFranchiseeInformation?.edges
          ?.map((edges) => {
            const products =
              edges?.node?.masterFranchiseeProduct
                ?.map((masterFranchiseeProduct) => {
                  return {
                    id: masterFranchiseeProduct?.product?.id,
                    name: masterFranchiseeProduct?.product?.name ?? "N/A",
                    price: masterFranchiseeProduct?.price,
                    productPoints: masterFranchiseeProduct?.product?.points,
                    type: "product",
                  };
                })
                ?.filter(notEmpty)
                ?.flat(2) ?? [];

            const workbooks =
              edges?.node?.masterFranchiseeWorkBook
                ?.map((masterFranchiseeWorkBook) => {
                  return {
                    id: masterFranchiseeWorkBook?.workbookInformation?.id,
                    name:
                      masterFranchiseeWorkBook?.workbookInformation?.name ??
                      "N/A",
                    price: masterFranchiseeWorkBook?.price,
                    productPoints:
                      masterFranchiseeWorkBook?.workbookInformation?.price,
                    type: "workbook",
                  };
                })
                ?.filter(notEmpty)
                ?.flat(2) ?? [];
            const terms = isTermNeed
              ? edges?.node?.masterFranchiseeEducationalTerm
                  ?.map((masterFranchiseeEducationalTerm) => {
                    return {
                      id: masterFranchiseeEducationalTerm?.educationalTerm?.id,
                      name:
                        masterFranchiseeEducationalTerm?.educationalTerm
                          ?.name ?? "N/A",
                      price: masterFranchiseeEducationalTerm?.price,
                      productPoints:
                        masterFranchiseeEducationalTerm?.educationalTerm?.price,
                      type: "term",
                    };
                  })
                  ?.filter(notEmpty)
                  ?.flat(2) ?? []
              : [];
            return [...products, ...workbooks, ...terms];
          })
          .filter(notEmpty)
          ?.flat(2)
      : [];
  }, [data?.filterMasterFranchiseeInformation?.edges, error?.message]);

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
              isMasterFranchiseeMasterFranchiseeProductNeed: true,
              isMasterFranchiseeMasterFranchiseeWorkBookNeed: true,
              isMasterFranchiseeMasterFranchiseeEducationalTermNeed: isTermNeed,
              ...args,
            },
            updateQuery: (
              _,
              { fetchMoreResult: { filterMasterFranchiseeInformation } }
            ) => {
              return {
                filterMasterFranchiseeInformation,
              };
            },
          }).catch((err) => {
            toastNotification(messageHelper(err));
          });
      }}
      placeholder={placeholder}
      shouldUnregister={shouldUnregister}
      by={
        ((a: any, b: any) => {
          return a?.id === b?.id && a?.type === b?.type;
        }) as unknown as any
      }
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
      allowCustomValue={allowCustomValue}
    />
  );
};

export default MasterFranchiseeItemField;
