import { useQuery, useReactiveVar } from "@apollo/client";
import { useMemo } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import { Combobox, ComboboxProps } from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { useInView } from "global/hook";
import { messageHelper } from "global/helpers";

import {
  EducationalLevelsFieldArgs,
  EducationalLevelsFilterInput,
  FILTER_EDUCATIONAL_LEVELS,
} from "modules/EducationMaterials/Levels";

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
  args?: { filter?: EducationalLevelsFilterInput } & EducationalLevelsFieldArgs;
};

const EducationLevelsField = <
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
  classNameForMultipleValueItem,
  classNameForParent,
  classNameForLabel,
  allowCustomValue,
  allowCustomValueAsString,
}: Props<TFieldValues, Name>) => {
  const defaultPageSize = useReactiveVar(paginationDefaultCount);
  const { data, loading, error, fetchMore } = useQuery(
    FILTER_EDUCATIONAL_LEVELS,
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
        data?.filterEducationalLevels?.pageInfo?.hasNextPage &&
        data?.filterEducationalLevels?.pageInfo?.endCursor &&
        !disabled &&
        !readOnly
      ) {
        fetchMore({
          variables: {
            pagination: {
              after: data?.filterEducationalLevels?.pageInfo?.endCursor,
              size: defaultPageSize,
            },
            ...args,
          },
          updateQuery: (
            prev,
            { fetchMoreResult: { filterEducationalLevels } }
          ) => {
            if (!filterEducationalLevels) return prev;
            return {
              filterEducationalLevels:
                filterEducationalLevels?.edges &&
                filterEducationalLevels?.edges?.length > 0 &&
                prev?.filterEducationalLevels
                  ? prev?.filterEducationalLevels?.edges &&
                    prev?.filterEducationalLevels?.edges?.length > 0
                    ? {
                        edges: [
                          ...prev.filterEducationalLevels.edges,
                          ...filterEducationalLevels.edges,
                        ],
                        pageInfo: filterEducationalLevels?.pageInfo,
                      }
                    : {
                        edges: filterEducationalLevels?.edges,
                        pageInfo: filterEducationalLevels?.pageInfo,
                      }
                  : prev.filterEducationalLevels,
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
      : data?.filterEducationalLevels?.edges &&
        data?.filterEducationalLevels?.edges?.length > 0
      ? data?.filterEducationalLevels?.edges
          ?.map((edges) => {
            if (edges?.node?.id && edges?.node?.name) {
              return edges?.node;
            } else {
              return null;
            }
          })
          .filter(Boolean)
      : [];
  }, [data?.filterEducationalLevels?.edges, error?.message]);

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
              { fetchMoreResult: { filterEducationalLevels } }
            ) => {
              return {
                filterEducationalLevels,
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
      canClear={canClear}
      defaultValue={defaultValue}
      optionRenderString={optionRenderString}
      placement={placement}
      valueRenderString={valueRenderString}
      classNameForMultipleValueItem={classNameForMultipleValueItem}
      classNameForParent={classNameForParent}
      classNameForLabel={classNameForLabel}
      allowCustomValue={allowCustomValue}
      allowCustomValueAsString={allowCustomValueAsString}
    />
  );
};

export { EducationLevelsField };
