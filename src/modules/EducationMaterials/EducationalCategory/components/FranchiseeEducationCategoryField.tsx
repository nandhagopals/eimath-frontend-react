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
  args: { franchiseeId: number; filter?: Omit<FranchiseeFilterInput, "id"> };
  fieldArgs?: Omit<
    FranchiseeFieldArgs,
    "isFranchiseeEducationalCategoriesNeed"
  >;

  fieldType?:
    | {
        type: "educationalLevel";
        categoryId: number;
      }
    | {
        type: "educationalTerm";
        categoryId: number;
        educationalLevelId: number;
      };
};

const FranchiseeEducationCategoryField = <
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
  fieldArgs,
  fieldType,
  allowCustomValue,
  allowCustomValueAsString,
}: Props<TFieldValues, Name>) => {
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const commonVariables = {
    filter: {
      id: {
        number: args?.franchiseeId,
      },
      ...args?.filter,
      status: args?.filter?.status
        ? args?.filter?.status
        : {
            isExactly: "Active",
          },
    },
    ...fieldArgs,
    isFranchiseeEducationalCategoriesNeed: true,
    franchiseeEducationalCategoryStatus: {
      isExactly: "Active",
    },
  };

  const variables =
    fieldType?.type === "educationalLevel"
      ? {
          ...commonVariables,
          franchiseeEducationalCategoryId: {
            number: fieldType?.categoryId,
          },
          franchiseeEducationalCategoryEducationalLevelStatus: {
            isExactly: "Active",
          },
          isFranchiseeEducationalCategoryEducationalLevelNeed: true,
        }
      : fieldType?.type === "educationalTerm"
      ? {
          ...commonVariables,
          franchiseeEducationalCategoryId: {
            number: fieldType?.categoryId,
          },
          franchiseeEducationalCategoryEducationalLevelStatus: {
            isExactly: "Active",
          },
          franchiseeEducationalCategoryEducationalLevelId: {
            number: fieldType?.educationalLevelId,
          },
          isFranchiseeEducationalCategoryEducationalLevelNeed: true,
          isFranchiseeEducationalCategoryEducationalLevelEducationalTermNeed:
            true,
        }
      : commonVariables;
  const { data, loading, error, fetchMore } = useQuery(FILTER_FRANCHISEES, {
    fetchPolicy: "cache-and-network",
    variables: {
      pagination: {
        size: defaultPageSize,
      },
      ...variables,
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
            ...variables,
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

  const options: { id: number; name: string }[] = useMemo(() => {
    return error?.message
      ? []
      : data?.filterFranchisees?.edges &&
        data?.filterFranchisees?.edges?.length > 0
      ? data?.filterFranchisees?.edges
          ?.map((edges) => {
            if (edges?.node?.id) {
              return (
                edges?.node?.educationalCategories
                  ?.map((educationalCategory) => {
                    if (educationalCategory?.id) {
                      return fieldType?.type === "educationalLevel"
                        ? educationalCategory?.educationalCategoryLevels
                            ?.map((educationalCategoryLevel) => {
                              if (
                                educationalCategoryLevel?.educationalLevel?.id
                              ) {
                                return {
                                  id: educationalCategoryLevel?.educationalLevel
                                    ?.id,
                                  name:
                                    educationalCategoryLevel?.educationalLevel
                                      ?.name ?? "N/A",
                                };
                              } else return null;
                            })
                            ?.filter(notEmpty) ?? []
                        : fieldType?.type === "educationalTerm"
                        ? educationalCategory?.educationalCategoryLevels
                            ?.map((educationalCategoryLevel) => {
                              return educationalCategoryLevel?.educationalLevel?.educationalLevelTerms?.map(
                                (educationalLevelTerm) => {
                                  if (
                                    educationalLevelTerm?.educationalTerm?.id
                                  ) {
                                    return {
                                      id: educationalLevelTerm?.educationalTerm
                                        ?.id,
                                      name:
                                        educationalLevelTerm?.educationalTerm
                                          ?.name ?? "N/A",
                                    };
                                  } else {
                                    return null;
                                  }
                                }
                              );
                            })
                            ?.flat(1)
                            ?.filter(notEmpty) ?? []
                        : {
                            id: educationalCategory?.id,
                            name: educationalCategory?.name
                              ? educationalCategory?.name
                              : "N/A",
                          };
                    } else return null;
                  })
                  ?.filter(notEmpty) ?? []
              );
            } else {
              return null;
            }
          })
          ?.flat(4)
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
              ...variables,
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

export { FranchiseeEducationCategoryField };
