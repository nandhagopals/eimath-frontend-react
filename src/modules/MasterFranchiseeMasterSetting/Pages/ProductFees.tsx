import { FC, useState } from "react";
import { Cell, Row } from "react-aria-components";
import { useWatch } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";

import { Body, Head, Table, TableAction } from "components/Table";
import { InputField } from "components/Form";
import { Button } from "components/Buttons";

import { paginationDefaultCount, toastNotification } from "global/cache";
import {
  fileDownload,
  messageHelper,
  somethingWentWrongMessage,
} from "global/helpers";
import {
  useAllowedResource,
  useAuth,
  useFormWithZod,
  usePreLoading,
} from "global/hook";
import DownloadIcon from "global/assets/images/file-download-filled.svg?react";

import {
  FILTER_MASTER_FRANCHISEE_PRODUCT_FEES,
  UPDATE_MASTER_FRANCHISEE_PRODUCT_FEE,
  FilterMasterFranchiseeProductFeesArgs,
  MasterFranchiseeProductFee,
  MasterFranchiseeProductFeeFieldArgs,
  EditPriceOrPointModal,
  masterFranchiseeProductFeesSortBySchema,
  GENERATE_MASTER_FRANCHISEE_PRODUCT_FEE_CSV,
  MasterFranchiseeInformation,
} from "modules/MasterFranchisee";
import { Page } from "modules/MasterFranchiseeMasterSetting";
import { ProductCategoryField } from "modules/Products";
import { ProductCategory } from "modules/Settings/ProductCategory";

const fieldArgs: MasterFranchiseeProductFeeFieldArgs = {
  isMasterFranchiseeProductFeePriceNeed: true,
  isMasterFranchiseeProductFeeProductNeed: true,
};

interface Props {
  navigateMasterFranchiseeTabHandler: (page: Page) => void;
  masterFranchiseeInformation: MasterFranchiseeInformation | null | undefined;
}

const ProductFees: FC<Props> = ({ masterFranchiseeInformation }) => {
  const { canUpdate } = useAllowedResource("MasterFranchiseeProduct", true);
  const canDownloadCSV = useAllowedResource("DownloadMasterFranchiseeProduct");
  const { authUserDetails } = useAuth();
  // const navigate = useNavigate();
  const defaultPageSize = useReactiveVar(paginationDefaultCount);
  const infoId =
    authUserDetails?.type === "MF Owner" || authUserDetails?.type === "MF Staff"
      ? authUserDetails?.id
      : null;

  const tableHeaders = canUpdate
    ? [
        { name: "ID", id: "id" as const, isRowHeader: true },
        { name: "Product Name", id: "productName" as const },
        { name: "Variance", id: "variance" as const, hideSort: true },
        { name: "Category", id: "category" as const, hideSort: true },
        {
          name: `Price ${
            masterFranchiseeInformation?.currencyCountry?.currency
              ? `(${masterFranchiseeInformation?.currencyCountry?.currency})`
              : ""
          }`,
          id: "price" as const,
        },
        { name: "Actions", id: "action" as const, hideSort: true },
      ]
    : [
        { name: "ID", id: "id" as const, isRowHeader: true },
        { name: "Product Name", id: "productName" as const },
        { name: "Variance", id: "variance" as const, hideSort: true },
        { name: "Category", id: "category" as const, hideSort: true },
        {
          name: `Price ${
            masterFranchiseeInformation?.currencyCountry?.currency
              ? `(${masterFranchiseeInformation?.currencyCountry?.currency})`
              : ""
          }`,
          id: "price" as const,
        },
      ];

  const { control } = useFormWithZod({
    schema: z.object({
      pageSize: z.number(),
      sortBy: masterFranchiseeProductFeesSortBySchema,
      category: z
        .object({
          id: z.number(),
          name: z.string(),
        })
        .nullish(),
      search: z.string().nullable(),
    }),
    defaultValues: {
      pageSize: defaultPageSize,
      sortBy: { column: "id", direction: "descending" },
      category: null,
      search: "",
    },
  });

  const [watchPageSize, watchSortBy, watchCategory, watchSearch] = useWatch({
    control,
    name: ["pageSize", "sortBy", "category", "search"],
  });

  const commonQueryArgs: FilterMasterFranchiseeProductFeesArgs = {
    ...fieldArgs,
    pagination: { size: watchPageSize },
    filter: {
      masterFranchiseeId: {
        number: infoId ? +infoId : undefined,
      },
      status: {
        inArray: ["Active"],
      },
      categoryId: watchCategory?.id
        ? {
            number: watchCategory?.id || undefined,
          }
        : undefined,
    },
    globalSearch: watchSearch || undefined,
    sortBy: watchSortBy?.column
      ? {
          column:
            watchSortBy?.column === "productName"
              ? ("product" as unknown as "productName")
              : watchSortBy?.column === "price"
              ? ("points" as unknown as "price")
              : watchSortBy?.column,
          order:
            watchSortBy?.direction === "ascending"
              ? ("ASC" as const)
              : ("DESC" as const),
          subClassField:
            watchSortBy?.column === "productName" ? "name" : undefined,
        }
      : undefined,
  };

  const { data, loading, fetchMore } = useQuery(
    FILTER_MASTER_FRANCHISEE_PRODUCT_FEES,
    {
      variables: commonQueryArgs,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      skip: infoId && !Number.isNaN(+infoId) ? false : true,
    }
  );

  const [confirmModal, setConfirmModal] = useState<{
    type: "editModal";
    productFee: MasterFranchiseeProductFee;
  } | null>(null);

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  const [updateMutation, { loading: updateLoading }] = useMutation(
    UPDATE_MASTER_FRANCHISEE_PRODUCT_FEE
  );

  const [generateCSV, { loading: csvFileLoading }] = useMutation(
    GENERATE_MASTER_FRANCHISEE_PRODUCT_FEE_CSV
  );

  const onSubmit: (value: number, onClose: () => void) => void = (
    value,
    onClose
  ) => {
    if (confirmModal?.type === "editModal" && confirmModal?.productFee?.id) {
      updateMutation({
        variables: {
          id: confirmModal?.productFee?.id,
          price: value,
        },
      })
        .then(({ data }) => {
          if (data?.updateMasterFranchiseeProductFee?.id) {
            onClose();
          } else {
            toastNotification([
              {
                message: "Something went wrong.",
                messageType: "error",
              },
            ]);
          }
        })
        .catch((err) => toastNotification(messageHelper(err)));
    }
  };

  const rows =
    data?.filterMasterFranchiseeProductFees?.edges?.map((edge) => ({
      id: edge?.node?.id,
      productName: edge?.node?.product?.name,
      variance: edge?.node?.product?.productVariance,
      category: edge?.node?.product?.productCategory,
      price:
        edge?.node?.price && Number.isInteger(edge?.node?.price)
          ? edge?.node?.price
          : edge?.node?.price && edge?.node?.price?.toFixed(2),
      action: "action" as const,
      productFee: edge?.node,
    })) || [];

  const onNext = () => {
    const queryArgs = commonQueryArgs;
    queryArgs.pagination = {
      size: watchPageSize,
      after: data?.filterMasterFranchiseeProductFees?.pageInfo?.endCursor,
    };
    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterMasterFranchiseeProductFees } }
      ) => {
        return { filterMasterFranchiseeProductFees };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPrev = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.pagination = {
      size: watchPageSize,
      before: data?.filterMasterFranchiseeProductFees?.pageInfo?.startCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterMasterFranchiseeProductFees } }
      ) => {
        return { filterMasterFranchiseeProductFees };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPageSizeChange: (page: number) => void = (page) => {
    const queryArgs = commonQueryArgs;

    queryArgs.pagination = {
      size: page,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterMasterFranchiseeProductFees } }
      ) => {
        return {
          filterMasterFranchiseeProductFees,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount =
    data?.filterMasterFranchiseeProductFees?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterMasterFranchiseeProductFees?.pageInfo?.hasNextPage &&
    data?.filterMasterFranchiseeProductFees?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterMasterFranchiseeProductFees?.pageInfo?.hasPreviousPage &&
    data?.filterMasterFranchiseeProductFees?.pageInfo?.startCursor
      ? true
      : false;

  const preLoading = usePreLoading(loading);

  const onSearchChange: (search: string | null | undefined) => void = (
    search
  ) => {
    const queryArgs = commonQueryArgs;

    queryArgs.globalSearch = search || undefined;

    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterMasterFranchiseeProductFees } }
      ) => {
        return {
          filterMasterFranchiseeProductFees,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onCategoryFilter: (
    category: ProductCategory | null | undefined
  ) => void = (category) => {
    const queryArgs = commonQueryArgs;

    queryArgs.filter = {
      categoryId: category?.id
        ? {
            number: category?.id,
          }
        : undefined,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterMasterFranchiseeProductFees } }
      ) => {
        return {
          filterMasterFranchiseeProductFees,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const generateCSVHandler = () => {
    if (infoId) {
      generateCSV({
        variables: {
          masterFranchiseeId: infoId,
        },
      })
        .then((response) => {
          if (
            response?.data?.generateMFProductCSV !== null &&
            response?.data?.generateMFProductCSV !== undefined &&
            response?.data?.generateMFProductCSV !== "No data found" &&
            response?.data?.generateMFProductCSV?.length > 5
          ) {
            fileDownload(response?.data?.generateMFProductCSV);
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((error) => {
          toastNotification(messageHelper(error));
        });
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between gap-2 flex-col sm:flex-row items-center mb-8 pt-2">
        <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start max-w-max">
          <InputField
            control={control}
            name="search"
            type="search"
            debounceOnChange={onSearchChange}
            variant="small"
            placeholder=""
            className="min-w-[220px] w-min"
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
        name="Product fees"
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
          className={"text-[14px] leading-5 tracking-[.17px]"}
        >
          {(item) => (
            <Row
              columns={tableHeaders}
              className={
                "hover:bg-action-hover focus:outline-none border-y last:border-b-transparent"
              }
            >
              {(column) => (
                <Cell className={"px-4 last:px-1 py-1"}>
                  {column?.id === "variance" || column?.id === "category" ? (
                    <div className="flex flex-wrap gap-1">
                      {column?.id === "variance"
                        ? item["variance"] && item["variance"]?.length > 0
                          ? item["variance"]?.map((variance) => (
                              <p
                                key={variance?.id}
                                className="text-primary-text rounded-full border border-action-disabled text-[13px] px-2.5 py-2"
                              >
                                {variance?.name}
                              </p>
                            ))
                          : "-"
                        : item["category"] && item["category"]?.length > 0
                        ? item["category"]?.map((category) => (
                            <p
                              key={category?.id}
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
                        type="pencil"
                        onAction={() => {
                          setConfirmModal({
                            type: "editModal",
                            productFee: item["productFee"]!,
                          });
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
      {/* <div className="flex justify-end gap-2.5 mt-16">
        <Button
          variant="outlined"
          className={"w-min shadow-none"}
          onPress={() => {
            navigate({
              to: "/master-setting",
              search: true,
            });
          }}
        >
          CLOSE
        </Button>
      </div> */}
      {confirmModal?.type === "editModal" ? (
        <EditPriceOrPointModal
          isOpen={confirmModal?.type === "editModal"}
          onClose={closeConfirmModal}
          loading={updateLoading}
          onSubmit={onSubmit}
          value={{
            page: "product-fee",
            productFee: confirmModal?.productFee,
          }}
          masterFranchiseeInformation={masterFranchiseeInformation}
        />
      ) : null}
    </div>
  );
};

export default ProductFees;
