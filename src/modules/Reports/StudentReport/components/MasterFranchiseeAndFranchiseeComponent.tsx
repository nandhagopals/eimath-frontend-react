import { useQuery, useReactiveVar } from "@apollo/client";
import { useMemo } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import { Combobox, ComboboxProps } from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { useInView } from "global/hook";
import { messageHelper, notEmpty } from "global/helpers";

import {
  FILTER_MASTER_FRANCHISEE_INFORMATION,
  MasterFranchiseeInformationFieldArgs,
  MasterFranchiseeInformationFilterInput,
} from "modules/MasterFranchisee";
import {
  FILTER_FRANCHISEES,
  FranchiseeFieldArgs,
  FranchiseeFilterInput,
} from "modules/Franchisee";

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
> & {
  masterFranchiseeArgs?: {
    filter?: MasterFranchiseeInformationFilterInput;
  } & Omit<
    MasterFranchiseeInformationFieldArgs,
    "isMasterFranchiseeInformationOwnerNameNeed"
  >;
  franchiseeArgs?: { filter?: FranchiseeFilterInput } & FranchiseeFieldArgs;
  isMasterFranchiseeNeed?: boolean;
  isFranchiseeNeed?: boolean;
};

const MasterFranchiseeAndFranchiseeComponent = <
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
  allowCustomValue,
  allowCustomValueAsString,
  masterFranchiseeArgs,
  classNameForLabel,
  classNameForMultipleValueItem,
  classNameForParent,
  isFranchiseeNeed = true,
  isMasterFranchiseeNeed = true,
  franchiseeArgs,
}: Props<TFieldValues, Name>) => {
  const defaultPageSize = useReactiveVar(paginationDefaultCount);
  const {
    data: filterMasterFranchiseeInformation,
    loading: filterMasterFranchiseeInformationLoading,
    error: filterMasterFranchiseeInformationError,
    fetchMore: filterMasterFranchiseeInformationFetchMore,
  } = useQuery(FILTER_MASTER_FRANCHISEE_INFORMATION, {
    fetchPolicy: "cache-and-network",
    variables: {
      pagination: {
        size: defaultPageSize,
      },
      ...masterFranchiseeArgs,
    },
    notifyOnNetworkStatusChange: true,
    skip: isMasterFranchiseeNeed ? (disabled || readOnly ? true : false) : true,
  });

  const {
    data: filterFranchisees,
    loading: filterFranchiseesLoading,
    error: filterFranchiseesError,
    fetchMore: filterFranchiseesFetchMore,
  } = useQuery(FILTER_FRANCHISEES, {
    fetchPolicy: "cache-and-network",
    variables: {
      pagination: {
        size: defaultPageSize,
      },
      ...franchiseeArgs,
    },
    notifyOnNetworkStatusChange: true,
    skip: isFranchiseeNeed ? (disabled || readOnly ? true : false) : true,
  });

  const { observe } = useInView({
    onEnter: () => {
      if (
        isMasterFranchiseeNeed &&
        !filterMasterFranchiseeInformationLoading &&
        filterMasterFranchiseeInformation?.filterMasterFranchiseeInformation
          ?.pageInfo?.hasNextPage &&
        filterMasterFranchiseeInformation?.filterMasterFranchiseeInformation
          ?.pageInfo?.endCursor &&
        !disabled &&
        !readOnly
      ) {
        filterMasterFranchiseeInformationFetchMore({
          variables: {
            pagination: {
              after:
                filterMasterFranchiseeInformation
                  ?.filterMasterFranchiseeInformation?.pageInfo?.endCursor,
              size: defaultPageSize,
            },
            ...masterFranchiseeArgs,
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

      if (
        isFranchiseeNeed &&
        !filterFranchiseesLoading &&
        filterFranchisees?.filterFranchisees?.pageInfo?.hasNextPage &&
        filterFranchisees?.filterFranchisees?.pageInfo?.endCursor &&
        !disabled &&
        !readOnly
      ) {
        filterFranchiseesFetchMore({
          variables: {
            pagination: {
              after: filterFranchisees?.filterFranchisees?.pageInfo?.endCursor,
              size: defaultPageSize,
            },
            ...franchiseeArgs,
          },
          updateQuery: (prev, { fetchMoreResult: { filterFranchisees } }) => {
            if (!filterFranchisees) return prev;
            return {
              filterFranchisees:
                filterFranchisees?.edges &&
                filterFranchisees?.edges?.length > 0 &&
                prev?.filterFranchisees
                  ? prev?.filterFranchisees?.edges &&
                    prev?.filterFranchisees?.edges?.length > 0
                    ? {
                        edges: [
                          ...prev.filterFranchisees.edges,
                          ...filterFranchisees.edges,
                        ],
                        pageInfo: filterFranchisees?.pageInfo,
                      }
                    : {
                        edges: filterFranchisees?.edges,
                        pageInfo: filterFranchisees?.pageInfo,
                      }
                  : prev.filterFranchisees,
            };
          },
        }).catch((err) => {
          toastNotification(messageHelper(err));
        });
      }
    },
  });

  const masterFranchiseeOptions = useMemo(() => {
    return isMasterFranchiseeNeed
      ? filterMasterFranchiseeInformationError?.message
        ? []
        : filterMasterFranchiseeInformation?.filterMasterFranchiseeInformation
            ?.edges &&
          filterMasterFranchiseeInformation?.filterMasterFranchiseeInformation
            ?.edges?.length > 0
        ? filterMasterFranchiseeInformation?.filterMasterFranchiseeInformation?.edges
            ?.map((edges) => {
              if (edges?.node?.id) {
                return {
                  ...edges?.node,
                  name: edges?.node?.masterFranchiseeName
                    ? edges?.node?.masterFranchiseeName
                    : "N/A",
                  fieldType: "masterFranchisee",
                };
              } else {
                return null;
              }
            })
            .filter(notEmpty)
        : []
      : [];
  }, [
    filterMasterFranchiseeInformation?.filterMasterFranchiseeInformation?.edges,
    filterMasterFranchiseeInformationError?.message,
  ]);

  const franchiseeOptions = useMemo(() => {
    return isFranchiseeNeed
      ? filterFranchiseesError?.message
        ? []
        : filterFranchisees?.filterFranchisees?.edges &&
          filterFranchisees?.filterFranchisees?.edges?.length > 0
        ? filterFranchisees?.filterFranchisees?.edges
            ?.map((edges) => {
              if (edges?.node?.id) {
                return {
                  ...edges?.node,
                  name: edges?.node?.franchiseeName
                    ? edges?.node?.franchiseeName
                    : "N/A",
                  fieldType: "franchisee",
                };
              } else {
                return null;
              }
            })
            .filter(notEmpty)
        : []
      : [];
  }, [
    filterFranchisees?.filterFranchisees?.edges,
    filterFranchiseesError?.message,
  ]);

  const options = [...masterFranchiseeOptions, ...franchiseeOptions];

  return (
    <Combobox
      control={control}
      name={name}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options={options as any}
      className={className}
      disabled={disabled}
      label={label}
      loading={filterMasterFranchiseeInformationLoading}
      multiple={multiple}
      observe={observe}
      onChange={onChange}
      onInputChange={(value) => {
        if (
          isMasterFranchiseeNeed &&
          !filterMasterFranchiseeInformationLoading &&
          !disabled
        ) {
          filterMasterFranchiseeInformationFetchMore({
            variables: {
              pagination: {
                size: defaultPageSize,
              },
              globalSearch: value || null,
              ...masterFranchiseeArgs,
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
        }

        if (isFranchiseeNeed && !filterFranchiseesLoading && !disabled)
          filterFranchiseesFetchMore({
            variables: {
              pagination: {
                size: defaultPageSize,
              },
              globalSearch: value || null,
              ...franchiseeArgs,
            },
            updateQuery: (_, { fetchMoreResult: { filterFranchisees } }) => {
              return {
                filterFranchisees,
              };
            },
          }).catch((err) => {
            toastNotification(messageHelper(err));
          });
      }}
      placeholder={placeholder}
      shouldUnregister={shouldUnregister}
      by={
        by ??
        (((a: any, b: any) => {
          return a?.id === b?.id && a?.fieldType === b?.fieldType;
        }) as unknown as any)
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
      allowCustomValueAsString={allowCustomValueAsString}
      classNameForLabel={classNameForLabel}
      classNameForMultipleValueItem={classNameForMultipleValueItem}
      classNameForParent={classNameForParent}
    />
  );
};

export default MasterFranchiseeAndFranchiseeComponent;
