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
  args?: {
    filter?: MasterFranchiseeInformationFilterInput;
  } & Omit<
    MasterFranchiseeInformationFieldArgs,
    "isMasterFranchiseeInformationOwnerNameNeed"
  >;
};

const MasterFranchiseeField = <
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
  allowCustomValue,
  allowCustomValueAsString,
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
            if (edges?.node?.id) {
              return {
                ...edges?.node,
                name: edges?.node?.masterFranchiseeName
                  ? edges?.node?.masterFranchiseeName
                  : "N/A",
              };
            } else {
              return null;
            }
          })
          .filter(notEmpty)
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
      allowCustomValue={allowCustomValue}
      allowCustomValueAsString={allowCustomValueAsString}
    />
  );
};

export default MasterFranchiseeField;
