/* eslint-disable @typescript-eslint/no-explicit-any */
import { Cell, Row } from "react-aria-components";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { useWatch } from "react-hook-form";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";

import { Body, Head, Table } from "components/Table";
import { Button } from "components/Buttons";
import { Select } from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import {
  useAllowedResource,
  useAuth,
  useFormWithZod,
  usePreLoading,
} from "global/hook";
import {
  fileDownload,
  messageHelper,
  months,
  notEmpty,
  numberGenerator,
  somethingWentWrongMessage,
} from "global/helpers";
import DownloadIcon from "global/assets/images/file-download-filled.svg?react";

import {
  FilterMasterFranchiseeRoyaltiesByMFArgs,
  MasterFranchiseeRoyalty,
  MasterFranchiseeRoyaltyFieldArgs,
  FILTER_MASTER_FRANCHISEE_ROYALTIES_BY_MF,
  FILTER_FRANCHISEE_ROYALTY_TRANSACTIONS,
  MasterFranchiseeRoyaltyTransaction,
  FilterMasterFranchiseeRoyaltyTransactionsFieldArgs,
  GENERATE_MASTER_FRANCHISEE_ROYALTY_BY_MF_CSV,
  GENERATE_MASTER_FRANCHISEE_ROYALTY_TRANSACTION_CSV,
  viewRoyaltyFilterSchema,
  FilterMasterFranchiseeRoyaltyTransactionsArgs,
} from "modules/Royalties";

const ViewRoyalty = () => {
  const canDownloadCSV = useAllowedResource("DownloadRoyalty");
  const navigate = useNavigate();

  const { authUserDetails } = useAuth();
  const isHQ = authUserDetails?.type === "User";

  const queryFieldArgs:
    | MasterFranchiseeRoyaltyFieldArgs
    | FilterMasterFranchiseeRoyaltyTransactionsFieldArgs = isHQ
    ? {
        isRevenueNeed: true,
        isStatusNeed: true,
        isMasterFranchiseeRoyaltyFranchiseeInformationNeed: true,
      }
    : {
        // isMonthNeed: true,
        // isYearNeed: true,
        isRevenueNeed: true,
        isMasterFranchiseeRoyaltyNeed: true,
        isStudentNeed: true,
      };

  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const royaltyIdAndMasterFranchiseeId = useParams({
    strict: false,
  });

  const royaltyId =
    "royaltyId" in royaltyIdAndMasterFranchiseeId
      ? royaltyIdAndMasterFranchiseeId?.royaltyId
      : null;

  const masterFranchiseeId =
    "masterFranchiseeId" in royaltyIdAndMasterFranchiseeId
      ? royaltyIdAndMasterFranchiseeId?.masterFranchiseeId
      : null;

  const searchParam = useSearch({ strict: false });

  const mfName = isHQ
    ? "mfName" in searchParam
      ? searchParam?.mfName
      : null
    : null;
  const mfPrefix = isHQ
    ? "mfPrefix" in searchParam
      ? searchParam?.mfPrefix
      : null
    : null;
  const franchiseeName = !isHQ
    ? "franchiseeName" in searchParam
      ? searchParam?.franchiseeName
      : null
    : null;
  const franchiseePrefix = !isHQ
    ? "franchiseePrefix" in searchParam
      ? searchParam?.franchiseePrefix
      : null
    : null;

  const { control } = useFormWithZod({
    schema: viewRoyaltyFilterSchema,
    defaultValues: {
      pageSize: defaultPageSize,
      sortBy: { column: "id", direction: "descending" },
      month: null,
      year: null,
    },
  });

  const [watchPageSize, watchSortBy, watchMonth, watchYear, watchStatus] =
    useWatch({
      control,
      name: ["pageSize", "sortBy", "month", "year", "status"],
    });

  const masterFranchiseeRoyaltyByMFQueryArgs:
    | FilterMasterFranchiseeRoyaltiesByMFArgs
    | undefined = masterFranchiseeId
    ? {
        ...queryFieldArgs,
        pagination: { size: watchPageSize },
        sortBy: watchSortBy?.column
          ? {
              column:
                watchSortBy?.column === "franchiseeId"
                  ? "franchiseeInformation"
                  : watchSortBy?.column === "royaltiesCollected"
                  ? "revenue"
                  : watchSortBy?.column ?? "id",
              order:
                watchSortBy?.direction === "ascending"
                  ? ("ASC" as const)
                  : ("DESC" as const),
              subClassField:
                watchSortBy?.column === "franchiseeId"
                  ? "franchiseeName"
                  : undefined,
            }
          : undefined,
        filter: {
          month: watchMonth
            ? {
                isExactly: watchMonth,
              }
            : undefined,
          year: watchYear
            ? {
                isExactly: `${watchYear}`,
              }
            : undefined,
          status: watchStatus
            ? {
                isExactly: watchStatus,
              }
            : undefined,
        },
        hqRoyaltyId: +masterFranchiseeId,
      }
    : undefined;

  const masterFranchiseeRoyaltyTransactionsQueryArgs:
    | FilterMasterFranchiseeRoyaltyTransactionsArgs
    | undefined = {
    ...queryFieldArgs,
    pagination: { size: watchPageSize },
    sortBy: watchSortBy?.column
      ? {
          column:
            watchSortBy?.column === "franchiseeId"
              ? "franchiseeInformation"
              : watchSortBy?.column === "royaltiesCollected"
              ? "revenue"
              : watchSortBy?.column ?? "id",
          order:
            watchSortBy?.direction === "ascending"
              ? ("ASC" as const)
              : ("DESC" as const),
          subClassField:
            watchSortBy?.column === "franchiseeId"
              ? "franchiseeName"
              : undefined,
        }
      : undefined,
    filter: {
      masterFranchiseeRoyaltyId:
        !isHQ && royaltyId
          ? {
              number: +royaltyId,
            }
          : undefined,
      month: watchMonth
        ? {
            isExactly: watchMonth,
          }
        : undefined,
      year: watchYear
        ? {
            isExactly: `${watchYear}`,
          }
        : undefined,
      status: watchStatus
        ? {
            isExactly: watchStatus,
          }
        : undefined,
    },
  };

  const {
    data: filterMasterFranchiseeRoyaltiesByMF,
    loading: masterFranchiseeRoyaltiesByMFLoading,
    fetchMore: fetchMoreMasterFranchiseeRoyaltiesByMF,
  } = useQuery(FILTER_MASTER_FRANCHISEE_ROYALTIES_BY_MF, {
    skip: isHQ ? false : true,
    variables: masterFranchiseeRoyaltyByMFQueryArgs,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const {
    data: filterMasterFranchiseeRoyaltyTransactions,
    loading: masterFranchiseeRoyaltyTransactionsLoading,
    fetchMore: fetchMoreMasterFranchiseeRoyaltyTransactions,
  } = useQuery(FILTER_FRANCHISEE_ROYALTY_TRANSACTIONS, {
    skip: isHQ ? true : false,
    variables: masterFranchiseeRoyaltyTransactionsQueryArgs,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const [
    generateMasterFranchiseeRoyaltyByMFCSV,
    { loading: masterFranchiseeRoyaltyByMFCSVLoading },
  ] = useMutation(GENERATE_MASTER_FRANCHISEE_ROYALTY_BY_MF_CSV);

  const [
    generateMasterFranchiseeRoyaltyTransactionCSV,
    { loading: masterFranchiseeRoyaltyTransactionCSVLoading },
  ] = useMutation(GENERATE_MASTER_FRANCHISEE_ROYALTY_TRANSACTION_CSV);

  const tableHeaders = [
    { name: "ID", id: "id", isRowHeader: true },
    {
      name: isHQ ? "Franchisee ID" : "Student",
      id: isHQ ? "franchiseeId" : ("studentName" as const),
      hideSort: isHQ ? false : true,
    },
    {
      name: `Revenue Collected ${
        filterMasterFranchiseeRoyaltiesByMF?.filterMasterFranchiseeRoyaltiesByMF
          ?.dataCollection?.edges?.[0]?.node?.franchiseeInformation
          ?.masterFranchiseeInformation?.currency
          ? ` (${filterMasterFranchiseeRoyaltiesByMF?.filterMasterFranchiseeRoyaltiesByMF?.dataCollection?.edges?.[0]?.node?.franchiseeInformation?.masterFranchiseeInformation?.currency})`
          : filterMasterFranchiseeRoyaltyTransactions
              ?.filterMasterFranchiseeRoyaltyTransactions?.edges?.[0]?.node
              ?.masterFranchiseeRoyalty?.franchiseeInformation
              ?.masterFranchiseeInformation?.currency
          ? ` (${filterMasterFranchiseeRoyaltyTransactions?.filterMasterFranchiseeRoyaltyTransactions?.edges?.[0]?.node?.masterFranchiseeRoyalty?.franchiseeInformation?.masterFranchiseeInformation?.currency})`
          : ""
      }`,
      id: "royaltiesCollected",
    },
    {
      name: "Status",
      id: "status",
    },
  ];

  const franchiseeRoyaltiesForMF =
    filterMasterFranchiseeRoyaltiesByMF?.filterMasterFranchiseeRoyaltiesByMF
      ?.dataCollection?.edges &&
    filterMasterFranchiseeRoyaltiesByMF?.filterMasterFranchiseeRoyaltiesByMF
      ?.dataCollection?.edges?.length > 0
      ? filterMasterFranchiseeRoyaltiesByMF?.filterMasterFranchiseeRoyaltiesByMF
          ?.dataCollection?.edges
      : [];

  const royalties: (
    | MasterFranchiseeRoyaltyTransaction
    | MasterFranchiseeRoyalty
  )[] = filterMasterFranchiseeRoyaltiesByMF
    ? franchiseeRoyaltiesForMF?.map((edge) => edge?.node)?.filter(notEmpty)
    : filterMasterFranchiseeRoyaltyTransactions
        ?.filterMasterFranchiseeRoyaltyTransactions?.edges &&
      filterMasterFranchiseeRoyaltyTransactions
        ?.filterMasterFranchiseeRoyaltyTransactions?.edges?.length > 0
    ? filterMasterFranchiseeRoyaltyTransactions?.filterMasterFranchiseeRoyaltyTransactions?.edges
        ?.map((edge) => edge?.node)
        ?.filter(notEmpty)
    : [];

  const rows =
    royalties?.map((royalty) => ({
      id: royalty?.id,
      franchiseeId:
        "franchiseeInformation" in royalty
          ? royalty?.franchiseeInformation?.franchiseeName
          : "masterFranchiseeRoyalty" in royalty
          ? royalty?.masterFranchiseeRoyalty?.franchiseeInformation
              ?.franchiseeName
          : "",
      studentName:
        "masterFranchiseeRoyalty" in royalty ? royalty?.student?.name : null,
      royaltiesCollected: `${
        "franchiseeInformation" in royalty
          ? royalty?.franchiseeInformation?.masterFranchiseeInformation
              ?.currency
          : ""
      } ${
        royalty?.revenue && Number.isInteger(royalty?.revenue)
          ? royalty?.revenue
          : royalty?.revenue && royalty?.revenue?.toFixed(2)
      }`,
      status:
        "franchiseeInformation" in royalty
          ? royalty?.status
          : "masterFranchiseeRoyalty" in royalty
          ? "Paid"
          : "",
    })) || [];

  const onNext = () => {
    const queryArgs = isHQ
      ? masterFranchiseeRoyaltyByMFQueryArgs
      : masterFranchiseeRoyaltyTransactionsQueryArgs;

    queryArgs
      ? (queryArgs.pagination = {
          size: watchPageSize,
          after: isHQ
            ? filterMasterFranchiseeRoyaltiesByMF
                ?.filterMasterFranchiseeRoyaltiesByMF?.dataCollection?.pageInfo
                ?.endCursor
            : filterMasterFranchiseeRoyaltyTransactions
                ?.filterMasterFranchiseeRoyaltyTransactions?.pageInfo
                ?.endCursor,
        })
      : undefined;

    if (isHQ) {
      fetchMoreMasterFranchiseeRoyaltiesByMF({
        variables: masterFranchiseeRoyaltyByMFQueryArgs,
        updateQuery: (
          _,
          { fetchMoreResult: { filterMasterFranchiseeRoyaltiesByMF } }
        ) => {
          return { filterMasterFranchiseeRoyaltiesByMF };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    } else {
      fetchMoreMasterFranchiseeRoyaltyTransactions({
        variables: masterFranchiseeRoyaltyTransactionsQueryArgs,
        updateQuery: (
          _,
          { fetchMoreResult: { filterMasterFranchiseeRoyaltyTransactions } }
        ) => {
          return { filterMasterFranchiseeRoyaltyTransactions };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }
  };

  const onPrev = () => {
    const queryArgs = isHQ
      ? masterFranchiseeRoyaltyByMFQueryArgs
      : masterFranchiseeRoyaltyTransactionsQueryArgs;

    queryArgs
      ? (queryArgs.pagination = {
          size: watchPageSize,
          before: isHQ
            ? filterMasterFranchiseeRoyaltiesByMF
                ?.filterMasterFranchiseeRoyaltiesByMF?.dataCollection?.pageInfo
                ?.startCursor
            : filterMasterFranchiseeRoyaltyTransactions
                ?.filterMasterFranchiseeRoyaltyTransactions?.pageInfo
                ?.startCursor,
        })
      : undefined;

    if (isHQ) {
      fetchMoreMasterFranchiseeRoyaltiesByMF({
        variables: masterFranchiseeRoyaltyByMFQueryArgs,
        updateQuery: (
          _,
          { fetchMoreResult: { filterMasterFranchiseeRoyaltiesByMF } }
        ) => {
          return { filterMasterFranchiseeRoyaltiesByMF };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    } else {
      fetchMoreMasterFranchiseeRoyaltyTransactions({
        variables: masterFranchiseeRoyaltyTransactionsQueryArgs,
        updateQuery: (
          _,
          { fetchMoreResult: { filterMasterFranchiseeRoyaltyTransactions } }
        ) => {
          return { filterMasterFranchiseeRoyaltyTransactions };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }
  };

  const onPageSizeChange: (page: number) => void = (page) => {
    const queryArgs = isHQ
      ? masterFranchiseeRoyaltyByMFQueryArgs
      : masterFranchiseeRoyaltyTransactionsQueryArgs;

    queryArgs
      ? (queryArgs.pagination = {
          size: page,
        })
      : undefined;

    if (isHQ) {
      fetchMoreMasterFranchiseeRoyaltiesByMF({
        variables: masterFranchiseeRoyaltyByMFQueryArgs,
        updateQuery: (
          _,
          { fetchMoreResult: { filterMasterFranchiseeRoyaltiesByMF } }
        ) => {
          return { filterMasterFranchiseeRoyaltiesByMF };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    } else {
      fetchMoreMasterFranchiseeRoyaltyTransactions({
        variables: masterFranchiseeRoyaltyTransactionsQueryArgs,
        updateQuery: (
          _,
          { fetchMoreResult: { filterMasterFranchiseeRoyaltyTransactions } }
        ) => {
          return { filterMasterFranchiseeRoyaltyTransactions };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }
  };

  const totalCount =
    filterMasterFranchiseeRoyaltiesByMF?.filterMasterFranchiseeRoyaltiesByMF
      ?.dataCollection?.pageInfo?.totalNumberOfItems ||
    filterMasterFranchiseeRoyaltyTransactions
      ?.filterMasterFranchiseeRoyaltyTransactions?.pageInfo
      ?.totalNumberOfItems ||
    0;

  const nextDisabled =
    (filterMasterFranchiseeRoyaltiesByMF?.filterMasterFranchiseeRoyaltiesByMF
      ?.dataCollection?.pageInfo?.hasNextPage &&
      filterMasterFranchiseeRoyaltiesByMF?.filterMasterFranchiseeRoyaltiesByMF
        ?.dataCollection?.pageInfo?.endCursor) ||
    (filterMasterFranchiseeRoyaltyTransactions
      ?.filterMasterFranchiseeRoyaltyTransactions?.pageInfo?.hasNextPage &&
      filterMasterFranchiseeRoyaltyTransactions
        ?.filterMasterFranchiseeRoyaltyTransactions?.pageInfo?.endCursor)
      ? true
      : false;

  const prevDisabled =
    (filterMasterFranchiseeRoyaltiesByMF?.filterMasterFranchiseeRoyaltiesByMF
      ?.dataCollection?.pageInfo?.hasPreviousPage &&
      filterMasterFranchiseeRoyaltiesByMF?.filterMasterFranchiseeRoyaltiesByMF
        ?.dataCollection?.pageInfo?.startCursor) ||
    (filterMasterFranchiseeRoyaltyTransactions
      ?.filterMasterFranchiseeRoyaltyTransactions?.pageInfo?.hasPreviousPage &&
      filterMasterFranchiseeRoyaltyTransactions
        ?.filterMasterFranchiseeRoyaltyTransactions?.pageInfo?.startCursor)
      ? true
      : false;

  const preLoading = usePreLoading(
    masterFranchiseeRoyaltiesByMFLoading ||
      masterFranchiseeRoyaltyTransactionsLoading
  );

  const generateCSVHandler = () => {
    if (isHQ) {
      generateMasterFranchiseeRoyaltyByMFCSV({
        variables: {
          masterFranchiseeId: masterFranchiseeId,
        },
      })
        .then((response) => {
          if (
            response?.data?.generateMasterFranchiseeRoyaltyByMFCSV !== null &&
            response?.data?.generateMasterFranchiseeRoyaltyByMFCSV !==
              undefined &&
            response?.data?.generateMasterFranchiseeRoyaltyByMFCSV?.length > 5
          ) {
            fileDownload(
              response?.data?.generateMasterFranchiseeRoyaltyByMFCSV
            );
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((error) => {
          toastNotification(messageHelper(error));
        });
    } else {
      generateMasterFranchiseeRoyaltyTransactionCSV()
        .then((response) => {
          if (
            response?.data?.generateMasterFranchiseeRoyaltyTransactionCSV !==
              null &&
            response?.data?.generateMasterFranchiseeRoyaltyTransactionCSV !==
              undefined &&
            response?.data?.generateMasterFranchiseeRoyaltyTransactionCSV
              ?.length > 5
          ) {
            fileDownload(
              response?.data?.generateMasterFranchiseeRoyaltyTransactionCSV
            );
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((error) => {
          toastNotification(messageHelper(error));
        });
    }
  };

  const onBackHandler = () => {
    navigate({
      to: "/royalties",
    });
  };

  const royaltySummary = [
    {
      title: "Total Franchise",
      value:
        filterMasterFranchiseeRoyaltiesByMF?.filterMasterFranchiseeRoyaltiesByMF
          ?.totalFranchisee || 0,
    },
    {
      title: "Total Receipts",
      value:
        filterMasterFranchiseeRoyaltiesByMF?.filterMasterFranchiseeRoyaltiesByMF
          ?.totalReceipts || 0,
    },
    {
      title: `Total Revenue Collected${
        filterMasterFranchiseeRoyaltiesByMF?.filterMasterFranchiseeRoyaltiesByMF
          ?.dataCollection?.edges?.[0]?.node?.franchiseeInformation
          ?.masterFranchiseeInformation?.currency
          ? ` (${filterMasterFranchiseeRoyaltiesByMF?.filterMasterFranchiseeRoyaltiesByMF?.dataCollection?.edges?.[0]?.node?.franchiseeInformation?.masterFranchiseeInformation?.currency})`
          : ""
      }`,
      value: filterMasterFranchiseeRoyaltiesByMF
        ?.filterMasterFranchiseeRoyaltiesByMF?.totalRoyaltiesCollected
        ? ` ${filterMasterFranchiseeRoyaltiesByMF?.filterMasterFranchiseeRoyaltiesByMF?.totalRoyaltiesCollected?.toFixed(
            2
          )}`
        : `${0}`,
    },
    {
      title: "To EiMath (SGD)",
      value: filterMasterFranchiseeRoyaltiesByMF
        ?.filterMasterFranchiseeRoyaltiesByMF?.totalEarnings
        ? `${filterMasterFranchiseeRoyaltiesByMF?.filterMasterFranchiseeRoyaltiesByMF?.totalEarnings?.toFixed(
            2
          )}`
        : `${0}`,
    },
  ];

  return (
    <div className="space-y-6 w-full sm:max-w-6xl py-2">
      <div className="flex justify-between">
        <div className="flex flex-col gap-2 truncate">
          <p className="text-primary-text font-sunbird text-[20px] font-normal leading-8 truncate">
            {isHQ
              ? mfPrefix ?? "Master Franchisee ID"
              : franchiseePrefix ?? "Franchisee ID"}
          </p>
          <p className="flex flex-col truncate">
            <span className="text-secondary-text text-base truncate">
              {isHQ
                ? mfName ?? "Master Franchise Name"
                : franchiseeName ?? "Franchise Name"}
            </span>
            {isHQ && (
              <span className="text-primary-text text-base truncate">
                Total Franchise:{" "}
                {filterMasterFranchiseeRoyaltiesByMF
                  ?.filterMasterFranchiseeRoyaltiesByMF?.totalFranchisee || "0"}
              </span>
            )}
          </p>
        </div>
        <Button
          className={
            "w-min h-min bg-none bg-secondary-button mr-2 text-primary-text hover:bg-secondary-button-hover"
          }
          onPress={onBackHandler}
        >
          BACK
        </Button>
      </div>

      <div className="flex flex-col flex-wrap sm:flex-row justify-between items-center gap-2">
        <div className="flex flex-col  lg:flex-row items-center md:justify-start gap-x-2 gap-y-2 lg:gap-y-0">
          <Select
            control={control}
            name="status"
            label="Status"
            options={["Paid", "Unpaid", "To process"]}
            variant="small"
            className="min-w-[220px] w-min"
            canClear
          />

          <Select
            control={control}
            name="month"
            label="Month"
            options={months}
            variant="small"
            className="min-w-[220px] w-min"
          />
          <Select
            control={control}
            name="year"
            label="Year"
            options={numberGenerator(true, 10, "DESC")}
            variant="small"
            className="min-w-[220px] w-min"
          />
        </div>
        {canDownloadCSV && totalCount > 0 && (
          <Button
            variant="outlined"
            onPress={generateCSVHandler}
            className={
              "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px] shadow-none"
            }
            loading={
              masterFranchiseeRoyaltyByMFCSVLoading ||
              masterFranchiseeRoyaltyTransactionCSVLoading
            }
            loadingColor="secondary"
          >
            <DownloadIcon />
            DOWNLOAD CSV
          </Button>
        )}
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-[29px]">
        {isHQ &&
          royaltySummary?.map((royalty, index) => (
            <div
              key={index}
              className={`border rounded-2xl p-4 md:p-8 ${
                index % 2 === 0
                  ? "border-primary-main"
                  : "border-secondary-dark"
              } `}
            >
              <h4 className="font-roboto text-[16px] font-normal leading-6 text-primary-main tracking-[.15px] whitespace-nowrap">
                {royalty?.title}
              </h4>
              <div className="flex justify-between items-center">
                <div className="font-sunbird leading-[42px] tracking-[.25px] text-[34px] text-secondary-dark">
                  {royalty?.value}
                </div>
              </div>
            </div>
          ))}
      </div>

      <Table
        name="Royalty"
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
                <Cell
                  className={`${isHQ ? "px-4 last:px-0" : "px-4 last:px-0"}`}
                >
                  {item[column?.id] ? (
                    item[column?.id] === "Paid" ||
                    item[column?.id] === "Unpaid" ||
                    item[column?.id] === "To process" ? (
                      <p
                        className={`w-min whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] my-[7px] ${
                          item?.status === "Paid"
                            ? "bg-none bg-success-main text-white"
                            : item?.status === "To process"
                            ? "bg-none bg-action-selected text-primary-text"
                            : item?.status === "Unpaid"
                            ? "bg-none bg-error-main text-white"
                            : ""
                        }`}
                      >
                        {item?.status}
                      </p>
                    ) : (
                      // : column?.id === "monthOrYear" ? (
                      // <span>
                      //   {typeof item?.monthOrYear === "string"
                      //     ? "-"
                      //     : `${
                      //         item?.monthOrYear?.month &&
                      //         typeof +item?.monthOrYear?.month === "number" &&
                      //         (+item?.monthOrYear?.month <= 12 ||
                      //           +item?.monthOrYear?.month > 0)
                      //           ? formatDate(
                      //               today(getLocalTimeZone())
                      //                 .set({
                      //                   month: +item?.monthOrYear?.month,
                      //                 })
                      //                 ?.toDate(getLocalTimeZone()),
                      //               "MMM"
                      //             )
                      //           : "-"
                      //       }/${item?.monthOrYear?.year}`}
                      // </span>
                      // )
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
    </div>
  );
};

export default ViewRoyalty;
