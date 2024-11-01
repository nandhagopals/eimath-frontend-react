import { useCallback, useState } from "react";
import { Cell, Row } from "react-aria-components";
import {
  useLazyQuery,
  useMutation,
  useQuery,
  useReactiveVar,
} from "@apollo/client";
import { useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";

import { Body, Head, Table, TableAction } from "components/Table";
import { Button } from "components/Buttons";
import { ConfirmModal } from "components/Modal";
import { InputField } from "components/Form";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";

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
  DELETE_PRODUCT_CATEGORY,
  FILTER_PRODUCT_CATEGORIES,
  GENERATE_PRODUCT_CATEGORY_CSV,
  productCategoryFilterSchema,
} from "modules/Settings/ProductCategory";

const headers = [
  { name: "ID", id: "id", isRowHeader: true },
  { name: "Name", id: "name" },
  { name: "Actions", id: "action", hideSort: true },
];

const ProductCategories = () => {
  const { canCreate, canDelete } = useAllowedResource("ProductCategory", true);
  const canDownloadCSV = useAllowedResource("DownloadProductCategory");
  const navigate = useNavigate();
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { control, resetField } = useFormWithZod({
    schema: productCategoryFilterSchema,
    defaultValues: {
      pageSize: defaultPageSize,
      sortBy: { column: "id", direction: "descending" },
    },
  });

  const [watchSearch, watchPageSize, watchSortBy] = useWatch({
    control,
    name: ["search", "pageSize", "sortBy"],
  });

  const { data, loading, fetchMore, updateQuery } = useQuery(
    FILTER_PRODUCT_CATEGORIES,
    {
      variables: {
        pagination: { size: watchPageSize },
        sortBy: watchSortBy?.column
          ? {
              column: watchSortBy?.column ?? "id",
              order:
                watchSortBy?.direction === "ascending"
                  ? ("ASC" as const)
                  : ("DESC" as const),
            }
          : undefined,
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
    }
  );

  const [fetchProductCategories, { loading: productCategoriesLoading }] =
    useLazyQuery(FILTER_PRODUCT_CATEGORIES, {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "network-only",
    });

  const [deleteProductCategory, { loading: deleteProductCategoryLoading }] =
    useMutation(DELETE_PRODUCT_CATEGORY);

  const [generateCSV, { loading: csvFileLoading }] = useMutation(
    GENERATE_PRODUCT_CATEGORY_CSV
  );

  const closeConfirmDelete = () => {
    setDeleteProductCategoryID(null);
  };

  const rows =
    data?.filterProductCategories?.edges?.map((edge) => ({
      id: edge?.node?.id,
      name: edge?.node?.name,
      action: "action" as const,
    })) || [];

  const onNext =() => {
    fetchMore({
      variables: {
        pagination: {
          size: watchPageSize,
          after: data?.filterProductCategories?.pageInfo?.endCursor,
        },
        globalSearch: watchSearch || undefined,
      },
      updateQuery: (_, { fetchMoreResult: { filterProductCategories } }) => {
        return { filterProductCategories };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPrev =() => {
    fetchMore({
      variables: {
        pagination: {
          size: watchPageSize,
          before: data?.filterProductCategories?.pageInfo?.startCursor,
        },
        globalSearch: watchSearch || undefined,
      },
      updateQuery: (_, { fetchMoreResult: { filterProductCategories } }) => {
        return { filterProductCategories };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPageSizeChange: (page: number) => void = 
    (page) => {
      fetchMore({
        variables: {
          pagination: {
            size: page,
          },
          globalSearch: watchSearch || undefined,
        },
        updateQuery: (_, { fetchMoreResult: { filterProductCategories } }) => {
          return {
            filterProductCategories,
          };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    };

  const totalCount =
    data?.filterProductCategories?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterProductCategories?.pageInfo?.hasNextPage &&
    data?.filterProductCategories?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterProductCategories?.pageInfo?.hasPreviousPage &&
    data?.filterProductCategories?.pageInfo?.startCursor
      ? true
      : false;

  const preLoading = usePreLoading(loading || productCategoriesLoading);

  const onSearchChange: (search: string | null | undefined) => void =
    useCallback(
      (search) => {
        fetchMore({
          variables: {
            pagination: {
              size: watchPageSize,
            },
            globalSearch: search || undefined,
          },
          updateQuery: (
            _,
            { fetchMoreResult: { filterProductCategories } }
          ) => {
            return {
              filterProductCategories,
            };
          },
        }).catch((error) => {
          toastNotification(messageHelper(error));
        });
      },
      [watchPageSize]
    );

  const deleteHandler = () => {
    if (deleteProductCategoryID) {
      deleteProductCategory({
        variables: {
          id: deleteProductCategoryID,
        },
      })
        .then((res) => {
          if (res?.data?.deleteProductCategory) {
            closeConfirmDelete();

            if (data?.filterProductCategories?.edges?.length === 1) {
              resetField("search", {
                defaultValue: "",
              });
              resetField("pageSize", {
                defaultValue: defaultPageSize,
              });

              fetchMore({
                variables: {
                  pagination: {
                    size: defaultPageSize,
                  },
                },
                updateQuery: (
                  _,
                  { fetchMoreResult: { filterProductCategories } }
                ) => {
                  return {
                    filterProductCategories,
                  };
                },
              }).catch((error) => {
                toastNotification(messageHelper(error));
              });
            } else if (data?.filterProductCategories?.pageInfo?.hasNextPage) {
              const deleteItemIndex =
                data?.filterProductCategories?.edges?.findIndex(
                  (edgeDetails) =>
                    edgeDetails?.node?.id === +deleteProductCategoryID
                );

              const nextPointCursorData =
                (deleteItemIndex || 0) + 1 === watchPageSize
                  ? data &&
                    data?.filterProductCategories &&
                    data.filterProductCategories?.edges &&
                    data.filterProductCategories?.edges[
                      (deleteItemIndex || 0) - 1
                    ]
                  : null;

              fetchProductCategories({
                variables: {
                  pagination: {
                    size: 1,
                    after:
                      nextPointCursorData?.cursor ||
                      data?.filterProductCategories?.pageInfo?.endCursor,
                  },
                },
              }).then((refetchRes) => {
                if (
                  refetchRes?.data?.filterProductCategories?.edges?.length === 1
                ) {
                  updateQuery(({ filterProductCategories }) => {
                    const olderRecord =
                      filterProductCategories?.edges?.filter(
                        (edgeDetails) =>
                          edgeDetails?.node?.id !== deleteProductCategoryID
                      ) || [];
                    return {
                      filterProductCategories: filterProductCategories
                        ? {
                            pageInfo: refetchRes?.data?.filterProductCategories
                              ?.pageInfo
                              ? {
                                  ...filterProductCategories?.pageInfo,
                                  endCursor:
                                    refetchRes?.data?.filterProductCategories
                                      ?.pageInfo?.endCursor,
                                  hasNextPage:
                                    refetchRes?.data?.filterProductCategories
                                      ?.pageInfo?.hasNextPage,
                                  totalNumberOfItems:
                                    refetchRes?.data?.filterProductCategories
                                      ?.pageInfo?.totalNumberOfItems,
                                }
                              : null,
                            edges:
                              refetchRes?.data?.filterProductCategories
                                ?.edges &&
                              refetchRes?.data?.filterProductCategories?.edges
                                ?.length > 0
                                ? [
                                    ...olderRecord,
                                    ...(refetchRes?.data
                                      ?.filterProductCategories?.edges || []),
                                  ]
                                : [],
                            __typename: filterProductCategories?.__typename,
                          }
                        : null,
                    };
                  });
                }
              });
            } else {
              updateQuery(({ filterProductCategories }) => {
                return {
                  filterProductCategories: filterProductCategories
                    ? {
                        pageInfo: filterProductCategories?.pageInfo
                          ? {
                              ...filterProductCategories?.pageInfo,
                              totalNumberOfItems: filterProductCategories
                                ?.pageInfo?.totalNumberOfItems
                                ? filterProductCategories?.pageInfo
                                    ?.totalNumberOfItems - 1
                                : 0,
                            }
                          : null,
                        edges:
                          filterProductCategories?.edges &&
                          filterProductCategories?.edges?.length > 0
                            ? filterProductCategories?.edges?.filter(
                                (edge) =>
                                  edge?.node?.id !== deleteProductCategoryID
                              ) || []
                            : [],
                        __typename: filterProductCategories?.__typename,
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
  };

  const [deleteProductCategoryID, setDeleteProductCategoryID] = useState<
    number | null
  >(null);

  const kebabMenuList = canDelete
    ? [{ id: "View/Edit" }, { id: "Delete" }]
    : [{ id: "View/Edit" }];

  const kebabMenuAction = (value, item) => {
    if (value?.id === "View/Edit" && item?.id) {
      navigate({
        to: "/settings/product-categories/$productCategoryId",
        params: {
          productCategoryId: item?.id?.toString(),
        },
      });
    } else if (value?.id === "Delete" && item?.id) {
      setDeleteProductCategoryID(item?.id);
    }
  };

  const generateCSVHandler = () => {
    generateCSV()
      .then((response) => {
        if (
          response?.data?.generateProductCategoryCSV !== null &&
          response?.data?.generateProductCategoryCSV !== undefined &&
          response?.data?.generateProductCategoryCSV?.length > 5
        ) {
          fileDownload(response?.data?.generateProductCategoryCSV);
        } else {
          toastNotification(somethingWentWrongMessage);
        }
      })
      .catch((error) => {
        toastNotification(messageHelper(error));
      });
  };

  return (
    <div className="space-y-6 w-full sm:max-w-5xl">
      <div className="flex justify-between gap-2 py-2">
        <TitleAndBreadcrumb
          title="Product Categories"
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Master Setting",
              to: "/settings/product-categories",
            },
            {
              name: "Product Categories",
              to: "/settings/product-categories",
            },
          ]}
        />
        {canCreate && (
          <Button
            onPress={() => {
              navigate({
                to: "/settings/product-categories/$productCategoryId",
                params: {
                  productCategoryId: "new",
                },
              });
            }}
            className={"w-max h-min flex items-center gap-2 px-4 uppercase"}
          >
            <AddIcon />
            Add Product Category
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
        name="Product Categories"
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
        <Head headers={headers} allowsSorting />
        <Body
          headers={headers}
          items={rows}
          defaultPageSize={defaultPageSize}
          loading={preLoading}
          className={
            "text-[14px] leading-5 tracking-[.17px] divide-y divide-gray-200"
          }
        >
          {(item) => (
            <Row
              columns={headers}
              className={"hover:bg-action-hover focus:outline-none"}
            >
              {(column) => (
                <Cell className={"px-4 last:px-0"}>
                  {item[column?.id] ? (
                    item[column?.id] === "action" ? (
                      <TableAction
                        type="kebab"
                        items={kebabMenuList}
                        onAction={(value) => {
                          kebabMenuAction(value, item);
                        }}
                      />
                    ) : (
                      item[column?.id]
                    )
                  ) : (
                    "N/A"
                  )}
                </Cell>
              )}
            </Row>
          )}
        </Body>
      </Table>

      <ConfirmModal
        message="Confirm delete?"
        onClose={closeConfirmDelete}
        button={{
          primary: {
            loading: deleteProductCategoryLoading,
            onPress: deleteHandler,
          },
          secondary: {
            isDisabled: deleteProductCategoryLoading,
          },
        }}
        isOpen={!!deleteProductCategoryID}
        loading={deleteProductCategoryLoading}
      />
    </div>
  );
};

export default ProductCategories;
