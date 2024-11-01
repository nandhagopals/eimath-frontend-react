import { useMemo } from "react";
import { useQuery, useReactiveVar } from "@apollo/client";
import type { FieldPath, FieldValues } from "react-hook-form";

import { Combobox, ComboboxProps } from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { useInView } from "global/hook";
import { messageHelper, notEmpty } from "global/helpers";

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
  args?: { filter?: FranchiseeFilterInput } & FranchiseeFieldArgs;
};

const FranchiseeField = <
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
  const { data, loading, error, fetchMore } = useQuery(FILTER_FRANCHISEES, {
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
        data?.filterFranchisees?.pageInfo?.hasNextPage &&
        data?.filterFranchisees?.pageInfo?.endCursor &&
        !disabled &&
        !readOnly
      ) {
        fetchMore({
          variables: {
            pagination: {
              after: data?.filterFranchisees?.pageInfo?.endCursor,
              size: defaultPageSize,
            },
            ...args,
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

  const options = useMemo(() => {
    return error?.message
      ? []
      : data?.filterFranchisees?.edges &&
        data?.filterFranchisees?.edges?.length > 0
      ? data?.filterFranchisees?.edges
          ?.map((edges) => {
            if (edges?.node?.id) {
              return {
                ...edges?.node,
                name: edges?.node?.franchiseeName
                  ? edges?.node?.franchiseeName
                  : "N/A",
              };
            } else {
              return null;
            }
          })
          .filter(notEmpty)
      : [];
  }, [data?.filterFranchisees?.edges, error?.message]);

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

export default FranchiseeField;
