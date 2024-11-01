import { useQuery, useReactiveVar } from "@apollo/client";
import { useMemo } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import { Combobox, ComboboxProps } from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { useInView } from "global/hook";
import { messageHelper } from "global/helpers";

import {
  FILTER_ROLES,
  RoleFieldArgs,
  RoleFilterInput,
} from "modules/Accounts/RoleAccess";

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
    filter?: RoleFilterInput;
  } & RoleFieldArgs;
};

const RoleField = <
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
}: Props<TFieldValues, Name>) => {
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { data, loading, error, fetchMore } = useQuery(FILTER_ROLES, {
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
        data?.filterRoles?.pageInfo?.hasNextPage &&
        data?.filterRoles?.pageInfo?.endCursor &&
        !disabled &&
        !readOnly
      ) {
        fetchMore({
          variables: {
            pagination: {
              after: data?.filterRoles?.pageInfo?.endCursor,
              size: defaultPageSize,
            },
            ...args,
          },
          updateQuery: (prev, { fetchMoreResult: { filterRoles } }) => {
            if (!filterRoles) return prev;
            return {
              filterRoles:
                filterRoles?.edges &&
                filterRoles?.edges?.length > 0 &&
                prev?.filterRoles
                  ? prev?.filterRoles?.edges &&
                    prev?.filterRoles?.edges?.length > 0
                    ? {
                        edges: [
                          ...prev.filterRoles.edges,
                          ...filterRoles.edges,
                        ],
                        pageInfo: filterRoles?.pageInfo,
                      }
                    : {
                        edges: filterRoles?.edges,
                        pageInfo: filterRoles?.pageInfo,
                      }
                  : prev.filterRoles,
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
      : data?.filterRoles?.edges && data?.filterRoles?.edges?.length > 0
      ? data?.filterRoles?.edges
          ?.map((edges) => {
            if (edges?.node?.id) {
              return {
                ...edges?.node,
                name: edges?.node?.name ? edges?.node?.name : "N/A",
              };
            } else {
              return null;
            }
          })
          .filter(Boolean)
      : [];
  }, [data?.filterRoles?.edges, error?.message]);

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
        if (!loading && !disabled && !readOnly && !readOnly)
          fetchMore({
            variables: {
              pagination: {
                size: defaultPageSize,
              },
              globalSearch: value || null,
              ...args,
            },
            updateQuery: (_, { fetchMoreResult: { filterRoles } }) => {
              return {
                filterRoles,
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
    />
  );
};

export { RoleField };
