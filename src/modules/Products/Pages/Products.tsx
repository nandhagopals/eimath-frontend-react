import { useCallback, useMemo, useState } from "react";
import { Cell, Row } from "react-aria-components";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { z } from "zod";
import { useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";

import { Body, Head, Table, TableAction } from "components/Table";
import { Button } from "components/Buttons";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { InputField } from "components/Form";
import { ConfirmModal } from "components/Modal";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { useAllowedResource, useFormWithZod, usePreLoading } from "global/hook";
import {
  fileDownload,
  messageHelper,
  somethingWentWrongMessage,
} from "global/helpers";
import AddIcon from "global/assets/images/add-filled.svg?react";
import DownloadIcon from "global/assets/images/file-download-filled.svg?react";

import {
  FILTER_PRODUCTS,
  FilterProductsArgs,
  GENERATE_PRODUCT_CSV,
  ProductsFieldArgs,
  UPDATE_PRODUCT,
  ProductCategoryField,
} from "modules/Products";
import { ProductCategory } from "modules/Settings/ProductCategory";

const productSortBySchema = z
  .object({
    column: z.union([
      z.literal("id"),
      z.literal("name"),
      z.literal("category"),
      z.literal("points"),
    ]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

const queryFieldArgs: ProductsFieldArgs = {
  isProductVarianceNeed: true,
  isProductCategoryNeed: true,
  isPointsNeed: true,
  isDescriptionNeed: true,
};

const tableHeaders = [
  { name: "ID", id: "id" as const, isRowHeader: true },
  { name: "Product Name", id: "name" as const },
  { name: "Variance", id: "variance" as const, hideSort: true },
  { name: "Category", id: "category" as const, hideSort: true },
  { name: "Points", id: "points" as const },
  { name: "Actions", id: "action" as const, hideSort: true },
];

const Products = () => {
  const { canCreate, canDelete } = useAllowedResource("Product", true);
  const canDownloadCSV = useAllowedResource("DownloadProduct");
  const navigate = useNavigate();
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { control, resetField } = useFormWithZod({
    schema: z.object({
      search: z.string().nullable(),
      pageSize: z.number(),
      category: z
        .object({
          id: z.number(),
          name: z.string(),
        })
        .nullish(),
      sortBy: productSortBySchema,
    }),
    defaultValues: {
      pageSize: defaultPageSize,
      sortBy: null,
      category: null,
    },
  });

  const [watchSearch, watchPageSize, watchCategory, watchSortBy] = useWatch({
    control,
    name: ["search", "pageSize", "category", "sortBy"],
  });

  const commonQueryArgs: FilterProductsArgs = useMemo(
    () => ({
      ...queryFieldArgs,
      pagination: { size: watchPageSize },
      filter: {
        productCategoryId: watchCategory?.id
          ? {
              number: watchCategory?.id || undefined,
            }
          : undefined,
        status: {
          isExactly: "Active",
        },
      },
      globalSearch: undefined,
      sortBy: watchSortBy?.column
        ? {
            column:
              watchSortBy?.column === "category"
                ? ("productCategory" as unknown as "category")
                : watchSortBy?.column,
            order:
              watchSortBy?.direction === "ascending"
                ? ("ASC" as const)
                : ("DESC" as const),
            subClassField:
              watchSortBy?.column === "category" ? "name" : undefined,
          }
        : undefined,
    }),
    [watchCategory?.id, watchSortBy?.column, watchSortBy?.direction]
  );

  const { data, loading, fetchMore, updateQuery } = useQuery(FILTER_PRODUCTS, {
    variables: commonQueryArgs,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const [updateMutation, { loading: updateLoading }] =
    useMutation(UPDATE_PRODUCT);

  const [generateCSV, { loading: csvFileLoading }] =
    useMutation(GENERATE_PRODUCT_CSV);

  const [confirmModal, setConfirmModal] = useState<{
    type: "Delete";
    id: number;
  } | null>(null);

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  const confirmDeleteHandler = () => {
    if (confirmModal?.id) {
      if (confirmModal?.type === "Delete") {
        updateMutation({
          variables: {
            id: confirmModal?.id,
            status: "Deleted",
            isStatusNeed: true,
          },
        })
          .then((res) => {
            if (res?.data?.updateProduct) {
              closeConfirmModal();

              if (data?.filterProducts?.edges?.length === 1) {
                resetField("search", {
                  defaultValue: "",
                });
                resetField("pageSize", {
                  defaultValue: defaultPageSize,
                });

                const queryArgs = commonQueryArgs;

                queryArgs.globalSearch = undefined;

                fetchMore({
                  variables: queryArgs,
                  updateQuery: (_, { fetchMoreResult: { filterProducts } }) => {
                    return {
                      filterProducts,
                    };
                  },
                }).catch((error) => {
                  toastNotification(messageHelper(error));
                });
              } else if (data?.filterProducts?.pageInfo?.hasNextPage) {
                const deleteItemIndex = data?.filterProducts?.edges?.findIndex(
                  (edgeDetails) => edgeDetails?.node?.id === +confirmModal?.id
                );

                const nextPointCursorData =
                  (deleteItemIndex || 0) + 1 === watchPageSize
                    ? data &&
                      data?.filterProducts &&
                      data.filterProducts?.edges &&
                      data.filterProducts?.edges[(deleteItemIndex || 0) - 1]
                    : null;

                const queryArgs = commonQueryArgs;

                queryArgs.pagination = {
                  size: 1,
                  after:
                    nextPointCursorData?.cursor ||
                    data?.filterProducts?.pageInfo?.endCursor,
                };

                fetchMore({
                  variables: queryArgs,
                }).then((refetchRes) => {
                  if (refetchRes?.data?.filterProducts?.edges?.length === 1) {
                    updateQuery(({ filterProducts }) => {
                      const olderRecord =
                        filterProducts?.edges?.filter(
                          (edgeDetails) =>
                            edgeDetails?.node?.id !== confirmModal?.id
                        ) || [];
                      return {
                        filterProducts: filterProducts
                          ? {
                              pageInfo: refetchRes?.data?.filterProducts
                                ?.pageInfo
                                ? {
                                    ...filterProducts?.pageInfo,
                                    endCursor:
                                      refetchRes?.data?.filterProducts?.pageInfo
                                        ?.endCursor,
                                    hasNextPage:
                                      refetchRes?.data?.filterProducts?.pageInfo
                                        ?.hasNextPage,
                                    totalNumberOfItems:
                                      refetchRes?.data?.filterProducts?.pageInfo
                                        ?.totalNumberOfItems,
                                  }
                                : null,
                              edges:
                                refetchRes?.data?.filterProducts?.edges &&
                                refetchRes?.data?.filterProducts?.edges
                                  ?.length > 0
                                  ? [
                                      ...olderRecord,
                                      ...(refetchRes?.data?.filterProducts
                                        ?.edges || []),
                                    ]
                                  : [],
                              __typename: filterProducts?.__typename,
                            }
                          : null,
                      };
                    });
                  }
                });
              } else {
                updateQuery(({ filterProducts }) => {
                  return {
                    filterProducts: filterProducts
                      ? {
                          pageInfo: filterProducts?.pageInfo
                            ? {
                                ...filterProducts?.pageInfo,
                                totalNumberOfItems: filterProducts?.pageInfo
                                  ?.totalNumberOfItems
                                  ? filterProducts?.pageInfo
                                      ?.totalNumberOfItems - 1
                                  : 0,
                              }
                            : null,
                          edges:
                            filterProducts?.edges &&
                            filterProducts?.edges?.length > 0
                              ? filterProducts?.edges?.filter(
                                  (edge) => edge?.node?.id !== confirmModal?.id
                                ) || []
                              : [],
                          __typename: filterProducts?.__typename,
                        }
                      : null,
                  };
                });
              }
            }
          })
          .catch((error) => {
            toastNotification(messageHelper(error));
          });
      }
    }
  };

  const rows =
    data?.filterProducts?.edges?.map((edge) => ({
      id: edge?.node?.id,
      name: edge?.node?.name,
      category: edge?.node?.productCategory,
      variance: edge?.node?.productVariance,
      points:
        edge?.node?.points && Number.isInteger(edge?.node?.points)
          ? edge?.node?.points
          : edge?.node?.points && edge?.node?.points?.toFixed(2),
      action: "action" as const,
    })) || [];

  const onNext = () => {
    const queryArgs = commonQueryArgs;
    queryArgs.globalSearch = watchSearch || undefined;
    queryArgs.pagination = {
      size: watchPageSize,
      after: data?.filterProducts?.pageInfo?.endCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterProducts } }) => {
        return { filterProducts };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPrev = () => {
    const queryArgs = commonQueryArgs;
    queryArgs.globalSearch = watchSearch || undefined;
    queryArgs.pagination = {
      size: watchPageSize,
      before: data?.filterProducts?.pageInfo?.startCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterProducts } }) => {
        return { filterProducts };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPageSizeChange: (page: number) => void = (page) => {
    const queryArgs = commonQueryArgs;
    queryArgs.globalSearch = watchSearch || undefined;
    queryArgs.pagination = {
      size: page,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterProducts } }) => {
        return {
          filterProducts,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount = data?.filterProducts?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterProducts?.pageInfo?.hasNextPage &&
    data?.filterProducts?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterProducts?.pageInfo?.hasPreviousPage &&
    data?.filterProducts?.pageInfo?.startCursor
      ? true
      : false;

  const preLoading = usePreLoading(loading);

  const onSearchChange: (search: string | null | undefined) => void =
    useCallback((search) => {
      const queryArgs = commonQueryArgs;

      queryArgs.globalSearch = search || undefined;

      fetchMore({
        variables: queryArgs,
        updateQuery: (_, { fetchMoreResult: { filterProducts } }) => {
          return {
            filterProducts,
          };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }, []);

  const onCategoryFilter: (
    category: ProductCategory | null | undefined
  ) => void = (category) => {
    const queryArgs = commonQueryArgs;
    queryArgs.globalSearch = watchSearch || undefined;
    queryArgs.filter = {
      status: commonQueryArgs.filter?.status,
      productCategoryId: category?.id
        ? {
            number: category?.id,
          }
        : undefined,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterProducts } }) => {
        return {
          filterProducts,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const kebabMenuList = canDelete
    ? [{ id: "View/Edit" }, { id: "Delete" }]
    : [{ id: "View/Edit" }];

  const kebabMenuAction = (value, item) => {
    if (item?.id) {
      switch (value?.id) {
        case "View/Edit": {
          navigate({
            to: "/products/$productId",
            params: {
              productId: item?.id?.toString(),
            },
          });

          break;
        }

        case "Delete": {
          setConfirmModal({
            type: "Delete",
            id: item?.id,
          });

          break;
        }

        default: {
          break;
        }
      }
    }
  };

  const generateCSVHandler = () => {
    generateCSV()
      .then((response) => {
        if (
          response?.data?.generateProductCSV !== null &&
          response?.data?.generateProductCSV !== undefined &&
          response?.data?.generateProductCSV?.length > 5
        ) {
          fileDownload(response?.data?.generateProductCSV);
        } else {
          toastNotification(somethingWentWrongMessage);
        }
      })
      .catch((error) => {
        toastNotification(messageHelper(error));
      });
  };

  return (
    <div className="space-y-6 w-full sm:max-w-6xl">
      <div className="flex justify-between gap-2 py-2">
        <TitleAndBreadcrumb
          title="Products"
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Products",
              to: "/products",
            },
          ]}
        />
        {canCreate && (
          <Button
            onPress={() => {
              navigate({
                to: "/products/$productId",
                params: {
                  productId: "new",
                },
              });
            }}
            className={
              "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px]"
            }
          >
            <AddIcon />
            ADD PRODUCT
          </Button>
        )}
      </div>
      <div className="flex justify-between gap-2 flex-col sm:flex-row items-center">
        <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start max-w-max">
          <InputField
            control={control}
            name="search"
            type="search"
            debounceOnChange={onSearchChange}
            variant="small"
            placeholder=""
          />
          <ProductCategoryField
            control={control}
            name={"category"}
            onChange={onCategoryFilter}
            variant="small"
            className="min-w-[220px] w-min"
            label="Category"
            canClear
          />
        </div>
        {canDownloadCSV && totalCount > 0 && (
          <Button
            variant="outlined"
            onPress={generateCSVHandler}
            className={
              "min-w-[220px] md:min-w-min w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px] shadow-none"
            }
            loading={csvFileLoading}
            loadingColor="secondary"
            form="view-file"
          >
            <DownloadIcon />
            DOWNLOAD CSV
          </Button>
        )}
      </div>
      <Table
        name="Products"
        footer={{
          onNext,
          onPageSizeChange,
          onPrev,
          nextDisabled,
          prevDisabled,
          control,
          noOfItem: rows?.length ?? 0,
        }}
        totalCount={totalCount}
        loading={preLoading}
        className={"font-roboto rounded"}
        control={control}
      >
        <Head headers={tableHeaders} allowsSorting />
        <Body
          headers={tableHeaders}
          items={rows}
          defaultPageSize={defaultPageSize}
          loading={!!preLoading}
          className={
            "text-[14px] leading-5 tracking-[.17px] divide-y divide-gray-200"
          }
        >
          {(item) => (
            <Row
              columns={tableHeaders}
              className={"hover:bg-action-hover focus:outline-none"}
            >
              {(column) => (
                <Cell key={column?.id} className={"px-4 last:px-1 py-1"}>
                  {column?.id === "variance" || column?.id === "category" ? (
                    <div className="flex flex-wrap gap-1">
                      {column?.id === "variance"
                        ? item["variance"] && item["variance"]?.length > 0
                          ? item["variance"]?.map((variance, index) => (
                              <p
                                key={index}
                                className="text-primary-text rounded-full border border-action-disabled text-[13px] px-2.5 py-2"
                              >
                                {variance?.name}
                              </p>
                            ))
                          : "-"
                        : item["category"] && item["category"]?.length > 0
                        ? item["category"]?.map((category, index) => (
                            <p
                              key={index}
                              className="text-primary-text rounded-full border border-action-disabled text-[13px] px-2.5 py-2"
                            >
                              {category?.name}
                            </p>
                          ))
                        : "-"}
                    </div>
                  ) : item[column?.id] ? (
                    item[column?.id] === "action" ? (
                      <TableAction
                        type="kebab"
                        items={kebabMenuList}
                        onAction={(value) => {
                          kebabMenuAction(value, item);
                        }}
                      />
                    ) : item[column?.id] ? (
                      item[column?.id]
                    ) : (
                      "-"
                    )
                  ) : (
                    "-"
                  )}
                </Cell>
              )}
            </Row>
          )}
        </Body>
      </Table>
      {confirmModal?.id && (
        <ConfirmModal
          message={`Confirm ${
            confirmModal?.type === "Delete" ? "Delete" : "Action"
          }?`}
          onClose={closeConfirmModal}
          button={{
            primary: {
              loading: updateLoading,
              onPress: confirmDeleteHandler,
            },
            secondary: {
              isDisabled: updateLoading,
            },
          }}
          isOpen={!!confirmModal?.id}
          loading={updateLoading}
        />
      )}
    </div>
  );
};

export default Products;
