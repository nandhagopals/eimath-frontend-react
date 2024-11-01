import { useQuery, useReactiveVar } from "@apollo/client";
import { useMemo } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import { Combobox, ComboboxProps } from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { useInView } from "global/hook";
import { messageHelper, notEmpty } from "global/helpers";

import {
  FILTER_PRODUCTS,
  ProductsFieldArgs,
  ProductsFilterInput,
} from "modules/Products";
import {
  FILTER_WORKBOOK_INFORMATION,
  WorkbookInformationFieldArgs,
  WorkbookInformationFilterInput,
} from "modules/EducationMaterials/WorkbookManagement";
import {
  EducationalTermsFieldArgs,
  EducationalTermsFilterInput,
  FILTER_EDUCATIONAL_TERMS,
} from "modules/EducationMaterials/Terms";

type Props<
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = Omit<
  ComboboxProps<TFieldValues, Name>,
  | "options"
  | "filterProductsLoading"
  | "onInputChange"
  | "searchKeys"
  | "validate"
  | "value"
  | "observe"
  // | "allowCustomValue"
  | "allowCustomValueAsString"
  | "loading"
> & {
  productArgs?: {
    filter?: ProductsFilterInput;
  } & Omit<ProductsFieldArgs, "isPointsNeed">;
  workbookInformationArgs?: {
    filter?: WorkbookInformationFilterInput;
  } & Omit<WorkbookInformationFieldArgs, "isPriceNeed">;
  termArgs?: {
    filter?: EducationalTermsFilterInput;
  } & Omit<EducationalTermsFieldArgs, "isPriceNeed">;
};

const ProductWorkbookTermField = <
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
  canClear,
  defaultValue,
  optionRenderString,
  placement,
  valueRenderString,
  classNameForLabel,
  classNameForMultipleValueItem,
  classNameForParent,
  productArgs,
  workbookInformationArgs,
  termArgs,
  allowCustomValue = false,
}: Props<TFieldValues, Name>) => {
  const defaultPageSize = useReactiveVar(paginationDefaultCount);
  const {
    data: filterProducts,
    loading: filterProductsLoading,
    error: filterProductsError,
    fetchMore: filterProductsFetchMore,
  } = useQuery(FILTER_PRODUCTS, {
    fetchPolicy: "cache-and-network",
    variables: {
      pagination: {
        size: defaultPageSize,
      },
      ...productArgs,
      isPointsNeed: true,
    },
    notifyOnNetworkStatusChange: true,
    skip: disabled || readOnly ? true : false,
  });

  const {
    data: filterWorkbookInformation,
    loading: filterWorkbookInformationLoading,
    error: filterWorkbookInformationError,
    fetchMore: filterWorkbookInformationFetchMore,
  } = useQuery(FILTER_WORKBOOK_INFORMATION, {
    fetchPolicy: "cache-and-network",
    variables: {
      pagination: {
        size: defaultPageSize,
      },
      ...workbookInformationArgs,
      isPriceNeed: true,
    },
    notifyOnNetworkStatusChange: true,
    skip: disabled || readOnly ? true : false,
  });

  const {
    data: filterEducationalTerms,
    loading: filterEducationalTermsLoading,
    error: filterEducationalTermsError,
    fetchMore: filterEducationalTermsFetchMore,
  } = useQuery(FILTER_EDUCATIONAL_TERMS, {
    fetchPolicy: "cache-and-network",
    variables: {
      pagination: {
        size: defaultPageSize,
      },
      ...termArgs,
      isPriceNeed: true,
    },
    notifyOnNetworkStatusChange: true,
    skip: disabled || readOnly ? true : false,
  });

  const { observe } = useInView({
    onEnter: () => {
      if (
        !filterProductsLoading &&
        filterProducts?.filterProducts?.pageInfo?.hasNextPage &&
        filterProducts?.filterProducts?.pageInfo?.endCursor &&
        !disabled &&
        !readOnly
      ) {
        filterProductsFetchMore({
          variables: {
            pagination: {
              after: filterProducts?.filterProducts?.pageInfo?.endCursor,
              size: defaultPageSize,
            },
            ...productArgs,
            isPointsNeed: true,
          },
          updateQuery: (prev, { fetchMoreResult: { filterProducts } }) => {
            if (!filterProducts) return prev;
            return {
              filterProducts:
                filterProducts?.edges &&
                filterProducts?.edges?.length > 0 &&
                prev?.filterProducts
                  ? prev?.filterProducts?.edges &&
                    prev?.filterProducts?.edges?.length > 0
                    ? {
                        edges: [
                          ...prev.filterProducts.edges,
                          ...filterProducts.edges,
                        ],
                        pageInfo: filterProducts?.pageInfo,
                      }
                    : {
                        edges: filterProducts?.edges,
                        pageInfo: filterProducts?.pageInfo,
                      }
                  : prev.filterProducts,
            };
          },
        }).catch((err) => {
          toastNotification(messageHelper(err));
        });
      }

      if (
        !filterWorkbookInformationLoading &&
        filterWorkbookInformation?.filterWorkbookInformation?.pageInfo
          ?.hasNextPage &&
        filterWorkbookInformation?.filterWorkbookInformation?.pageInfo
          ?.endCursor &&
        !disabled &&
        !readOnly
      ) {
        filterWorkbookInformationFetchMore({
          variables: {
            pagination: {
              after:
                filterWorkbookInformation?.filterWorkbookInformation?.pageInfo
                  ?.endCursor,
              size: defaultPageSize,
            },
            ...workbookInformationArgs,
            isPriceNeed: true,
          },
          updateQuery: (
            prev,
            { fetchMoreResult: { filterWorkbookInformation } }
          ) => {
            if (!filterWorkbookInformation) return prev;
            return {
              filterWorkbookInformation:
                filterWorkbookInformation?.edges &&
                filterWorkbookInformation?.edges?.length > 0 &&
                prev?.filterWorkbookInformation
                  ? prev?.filterWorkbookInformation?.edges &&
                    prev?.filterWorkbookInformation?.edges?.length > 0
                    ? {
                        edges: [
                          ...prev.filterWorkbookInformation.edges,
                          ...filterWorkbookInformation.edges,
                        ],
                        pageInfo: filterWorkbookInformation?.pageInfo,
                      }
                    : {
                        edges: filterWorkbookInformation?.edges,
                        pageInfo: filterWorkbookInformation?.pageInfo,
                      }
                  : prev.filterWorkbookInformation,
            };
          },
        }).catch((err) => {
          toastNotification(messageHelper(err));
        });
      }

      if (
        !filterEducationalTermsLoading &&
        filterEducationalTerms?.filterEducationalTerms?.pageInfo?.hasNextPage &&
        filterEducationalTerms?.filterEducationalTerms?.pageInfo?.endCursor &&
        !disabled &&
        !readOnly
      ) {
        filterEducationalTermsFetchMore({
          variables: {
            pagination: {
              after:
                filterEducationalTerms?.filterEducationalTerms?.pageInfo
                  ?.endCursor,
              size: defaultPageSize,
            },
            ...termArgs,
            isPriceNeed: true,
          },
          updateQuery: (
            prev,
            { fetchMoreResult: { filterEducationalTerms } }
          ) => {
            if (!filterEducationalTerms) return prev;
            return {
              filterEducationalTerms:
                filterEducationalTerms?.edges &&
                filterEducationalTerms?.edges?.length > 0 &&
                prev?.filterEducationalTerms
                  ? prev?.filterEducationalTerms?.edges &&
                    prev?.filterEducationalTerms?.edges?.length > 0
                    ? {
                        edges: [
                          ...prev.filterEducationalTerms.edges,
                          ...filterEducationalTerms.edges,
                        ],
                        pageInfo: filterEducationalTerms?.pageInfo,
                      }
                    : {
                        edges: filterEducationalTerms?.edges,
                        pageInfo: filterEducationalTerms?.pageInfo,
                      }
                  : prev.filterEducationalTerms,
            };
          },
        }).catch((err) => {
          toastNotification(messageHelper(err));
        });
      }
    },
  });

  const productOptions = useMemo(() => {
    return filterProductsError?.message
      ? []
      : filterProducts?.filterProducts?.edges &&
        filterProducts?.filterProducts?.edges?.length > 0
      ? filterProducts?.filterProducts?.edges
          ?.map((edges) => {
            if (edges?.node?.id && edges?.node?.name) {
              return {
                ...edges?.node,
                type: "product",
                price: edges?.node?.points,
              };
            } else {
              return null;
            }
          })
          .filter(notEmpty)
      : [];
  }, [filterProducts?.filterProducts?.edges, filterProductsError?.message]);

  const workbookInformationOptions = useMemo(() => {
    return filterWorkbookInformationError?.message
      ? []
      : filterWorkbookInformation?.filterWorkbookInformation?.edges &&
        filterWorkbookInformation?.filterWorkbookInformation?.edges?.length > 0
      ? filterWorkbookInformation?.filterWorkbookInformation?.edges
          ?.map((edges) => {
            if (edges?.node?.id && edges?.node?.name) {
              return { ...edges?.node, type: "workbook" };
            } else {
              return null;
            }
          })
          .filter(notEmpty)
      : [];
  }, [
    filterWorkbookInformation?.filterWorkbookInformation?.edges,
    filterWorkbookInformationError?.message,
  ]);

  const termOptions = useMemo(() => {
    return filterEducationalTermsError?.message
      ? []
      : filterEducationalTerms?.filterEducationalTerms?.edges &&
        filterEducationalTerms?.filterEducationalTerms?.edges?.length > 0
      ? filterEducationalTerms?.filterEducationalTerms?.edges
          ?.map((edges) => {
            if (edges?.node?.id && edges?.node?.name) {
              return { ...edges?.node, type: "term" };
            } else {
              return null;
            }
          })
          .filter(notEmpty)
      : [];
  }, [
    filterEducationalTerms?.filterEducationalTerms?.edges,
    filterEducationalTermsError?.message,
  ]);

  const options = [
    ...productOptions,
    ...workbookInformationOptions,
    ...termOptions,
  ]?.filter(notEmpty);

  return (
    <Combobox
      control={control}
      name={name}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options={options as any}
      className={className}
      disabled={disabled}
      label={label}
      loading={filterProductsLoading}
      multiple={multiple}
      observe={observe}
      onChange={onChange}
      onInputChange={(value) => {
        if (!filterProductsLoading && !disabled && !readOnly) {
          filterProductsFetchMore({
            variables: {
              pagination: {
                size: defaultPageSize,
              },
              globalSearch: value || null,
              ...productArgs,
              isPointsNeed: true,
            },
            updateQuery: (_, { fetchMoreResult: { filterProducts } }) => {
              return {
                filterProducts,
              };
            },
          }).catch((err) => {
            toastNotification(messageHelper(err));
          });
        }

        if (!filterWorkbookInformationLoading && !disabled && !readOnly) {
          filterWorkbookInformationFetchMore({
            variables: {
              pagination: {
                size: defaultPageSize,
              },
              globalSearch: value || null,
              ...workbookInformationArgs,
              isPriceNeed: true,
            },
            updateQuery: (
              _,
              { fetchMoreResult: { filterWorkbookInformation } }
            ) => {
              return {
                filterWorkbookInformation,
              };
            },
          }).catch((err) => {
            toastNotification(messageHelper(err));
          });
        }

        if (!filterEducationalTermsLoading && !disabled && !readOnly) {
          filterEducationalTermsFetchMore({
            variables: {
              pagination: {
                size: defaultPageSize,
              },
              globalSearch: value || null,
              ...termArgs,
              isPriceNeed: true,
            },
            updateQuery: (
              _,
              { fetchMoreResult: { filterEducationalTerms } }
            ) => {
              return {
                filterEducationalTerms,
              };
            },
          }).catch((err) => {
            toastNotification(messageHelper(err));
          });
        }
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
      classNameForLabel={classNameForLabel}
      classNameForMultipleValueItem={classNameForMultipleValueItem}
      classNameForParent={classNameForParent}
      allowCustomValue={allowCustomValue}
    />
  );
};

export default ProductWorkbookTermField;
