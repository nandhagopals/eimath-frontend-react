import { useQuery, useReactiveVar } from "@apollo/client";
import { useMemo } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import { Combobox, ComboboxProps } from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { useInView } from "global/hook";
import { messageHelper, notEmpty } from "global/helpers";

import {
  EducationalCategoryFieldArgs,
  EducationalCategoryFilterInput,
  FILTER_EDUCATIONAL_CATEGORIES,
} from "modules/EducationMaterials/EducationalCategory";

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
  args: {
    categoryId: number;
    filter?: EducationalCategoryFilterInput;
  };
  fieldArgs?: EducationalCategoryFieldArgs;
  isEducationalCategoryFieldNeed?: boolean;
};

const EducationalCategoryEducationalLevelField = <
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
  fieldArgs,
  isEducationalCategoryFieldNeed,
  allowCustomValue,
  allowCustomValueAsString,
}: Props<TFieldValues, Name>) => {
  const defaultPageSize = useReactiveVar(paginationDefaultCount);
  const { data, loading, error, fetchMore } = useQuery(
    FILTER_EDUCATIONAL_CATEGORIES,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        pagination: {
          size: defaultPageSize,
        },
        filter: {
          id: {
            number: args?.categoryId,
          },
          ...args?.filter,
          status: args?.filter?.status
            ? args?.filter?.status
            : {
                isExactly: "Active",
              },
        },
        ...fieldArgs,
        isEducationalCategoryEducationalLevelsNeed: true,
      },
      notifyOnNetworkStatusChange: true,
      skip: args?.categoryId ? (disabled || readOnly ? true : false) : true,
    }
  );

  const { observe } = useInView({
    onEnter: () => {
      if (
        !loading &&
        data?.filterEducationalCategories?.pageInfo?.hasNextPage &&
        data?.filterEducationalCategories?.pageInfo?.endCursor &&
        !disabled &&
        !readOnly
      ) {
        fetchMore({
          variables: {
            pagination: {
              after: data?.filterEducationalCategories?.pageInfo?.endCursor,
              size: defaultPageSize,
            },
            filter: {
              id: {
                number: args?.categoryId,
              },
              ...args?.filter,
              status: args?.filter?.status
                ? args?.filter?.status
                : {
                    isExactly: "Active",
                  },
            },
            ...fieldArgs,
            isEducationalCategoryEducationalLevelsNeed: true,
          },
          updateQuery: (
            prev,
            { fetchMoreResult: { filterEducationalCategories } }
          ) => {
            if (!filterEducationalCategories) return prev;
            return {
              filterEducationalCategories:
                filterEducationalCategories?.edges &&
                filterEducationalCategories?.edges?.length > 0 &&
                prev?.filterEducationalCategories
                  ? prev?.filterEducationalCategories?.edges &&
                    prev?.filterEducationalCategories?.edges?.length > 0
                    ? {
                        edges: [
                          ...prev.filterEducationalCategories.edges,
                          ...filterEducationalCategories.edges,
                        ],
                        pageInfo: filterEducationalCategories?.pageInfo,
                      }
                    : {
                        edges: filterEducationalCategories?.edges,
                        pageInfo: filterEducationalCategories?.pageInfo,
                      }
                  : prev.filterEducationalCategories,
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
      : data?.filterEducationalCategories?.edges &&
        data?.filterEducationalCategories?.edges?.length > 0
      ? data?.filterEducationalCategories?.edges
          ?.map((edges) => {
            if (edges?.node?.id) {
              return edges?.node?.educationalCategoryLevels
                ?.map((educationalLevel) => {
                  if (educationalLevel?.educationalLevel?.id) {
                    return isEducationalCategoryFieldNeed
                      ? {
                          id: educationalLevel?.educationalLevel?.id,
                          name: educationalLevel?.educationalLevel?.name
                            ? educationalLevel?.educationalLevel?.name
                            : "N/A",
                          educationalCategoryField: edges?.node,
                        }
                      : {
                          id: educationalLevel?.educationalLevel?.id,
                          name: educationalLevel?.educationalLevel?.name
                            ? educationalLevel?.educationalLevel?.name
                            : "N/A",
                        };
                  } else return null;
                })
                ?.filter(notEmpty);
            } else {
              return null;
            }
          })
          .flat(1)
          .filter(notEmpty)
      : [];
  }, [
    data?.filterEducationalCategories?.edges,
    error?.message,
    isEducationalCategoryFieldNeed,
  ]);

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
              filter: {
                id: {
                  number: args?.categoryId,
                },
                ...args?.filter,
                status: args?.filter?.status
                  ? args?.filter?.status
                  : {
                      isExactly: "Active",
                    },
              },
              ...fieldArgs,
              isEducationalCategoryEducationalLevelsNeed: true,
            },
            updateQuery: (
              _,
              { fetchMoreResult: { filterEducationalCategories } }
            ) => {
              return {
                filterEducationalCategories,
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
      allowCustomValue={allowCustomValue}
      allowCustomValueAsString={allowCustomValueAsString}
    />
  );
};

export { EducationalCategoryEducationalLevelField };
