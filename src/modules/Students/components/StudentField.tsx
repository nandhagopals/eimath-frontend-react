import { useMemo } from "react";
import { useQuery, useReactiveVar } from "@apollo/client";
import type { FieldPath, FieldValues } from "react-hook-form";

import { Combobox, ComboboxProps } from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { useInView } from "global/hook";
import { messageHelper, notEmpty } from "global/helpers";

import {
  FILTER_STUDENTS,
  StudentFieldArgs,
  StudentsFilterInput,
} from "modules/Students";

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
    filter?: StudentsFilterInput;
  } & StudentFieldArgs;
};

const StudentField = <
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
  const { data, loading, error, fetchMore } = useQuery(FILTER_STUDENTS, {
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
        data?.filterStudents?.pageInfo?.hasNextPage &&
        data?.filterStudents?.pageInfo?.endCursor &&
        !disabled &&
        !readOnly
      ) {
        fetchMore({
          variables: {
            pagination: {
              after: data?.filterStudents?.pageInfo?.endCursor,
              size: defaultPageSize,
            },
            ...args,
          },
          updateQuery: (prev, { fetchMoreResult: { filterStudents } }) => {
            if (!filterStudents) return prev;
            return {
              filterStudents:
                filterStudents?.edges &&
                filterStudents?.edges?.length > 0 &&
                prev?.filterStudents
                  ? prev?.filterStudents?.edges &&
                    prev?.filterStudents?.edges?.length > 0
                    ? {
                        edges: [
                          ...prev.filterStudents.edges,
                          ...filterStudents.edges,
                        ],
                        pageInfo: filterStudents?.pageInfo,
                      }
                    : {
                        edges: filterStudents?.edges,
                        pageInfo: filterStudents?.pageInfo,
                      }
                  : prev.filterStudents,
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
      : data?.filterStudents?.edges && data?.filterStudents?.edges?.length > 0
      ? data?.filterStudents?.edges
          ?.map((edges) => {
            if (edges?.node?.name && edges?.node?.id) {
              return {
                id: edges?.node?.id,
                name: edges?.node?.name,
              };
            } else {
              return null;
            }
          })
          .filter(notEmpty)
      : [];
  }, [data?.filterStudents?.edges, error?.message]);

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
              ...args,
              globalSearch: value || null,
            },
            updateQuery: (_, { fetchMoreResult: { filterStudents } }) => {
              return {
                filterStudents,
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

export default StudentField;
