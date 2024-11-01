/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useCallback, useMemo, useState } from "react";
import { Cell, Row } from "react-aria-components";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { useWatch } from "react-hook-form";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";

import { Body, Head, Table, TableAction } from "components/Table";
import { Button } from "components/Buttons";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { Combobox, DateField, InputField } from "components/Form";

import AddIcon from "global/assets/images/add-filled.svg?react";
import { paginationDefaultCount, toastNotification } from "global/cache";
import {
  useAllowedResource,
  useAuth,
  useFormWithZod,
  usePreLoading,
} from "global/hook";
import {
  fileDownload,
  formatDate,
  messageHelper,
  somethingWentWrongMessage,
} from "global/helpers";
import DownloadIcon from "global/assets/images/file-download-filled.svg?react";

import {
  FILTER_MASTER_FRANCHISEE_POINTS_TRANSACTIONS,
  FilterMasterFranchiseePointsTransactionsArgs,
  GENERATE_MF_POINTS_TRANSACTION_CSV,
  MasterFranchiseePointsTransactionsFieldArgs,
  transactionHistoryFilterSchema,
} from "modules/PointsManagement";
import PurchaseOfPointsModal from "modules/PointsManagement/TransactionHistory/Pages/PurchaseOfPointsModal";
import RemarksModal from "modules/PointsManagement/TransactionHistory/Pages/RemarksModal";

interface Props {
  isMasterFranchisee?: boolean;
}

const queryFieldArgs: MasterFranchiseePointsTransactionsFieldArgs = {
  isCreatedAtNeed: true,
  isPointsNeed: true,
  isTypeNeed: true,
  isRemarksNeed: true,
  isMasterFranchiseePointNeed: true,
};

const commonTableHeaders = [
  { name: "Points", id: "points" },
  { name: "Type", id: "type" },
  { name: "Date", id: "date", hideSort: true },
  { name: "Actions", id: "action", hideSort: true },
];

const TransactionHistory: FC<Props> = ({ isMasterFranchisee }) => {
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const navigate = useNavigate();

  const { control } = useFormWithZod({
    schema: transactionHistoryFilterSchema,
    defaultValues: {
      pageSize: defaultPageSize,
      date: null,
      type: null,
      sortBy: { column: "id", direction: "descending" },
    },
  });

  const [watchSearch, watchPageSize, watchSortBy, watchType] = useWatch({
    control,
    name: ["search", "pageSize", "sortBy", "type"],
  });

  const search = useSearch({
    strict: false,
  });

  const navigateFrom = "navigateFrom" in search ? search?.navigateFrom : null;

  const { authUserDetails } = useAuth();

  const canPurchasePoints = useAllowedResource("ManageMasterFranchiseePoint");

  const canDownloadCSV = useAllowedResource(
    "DownloadMasterFranchiseePointsTransaction"
  );

  const masterFranchiseeIdFromParams = useParams({
    strict: false,
  });

  const masterFranchiseeId =
    authUserDetails?.type === "MF Owner" || authUserDetails?.type === "MF Staff"
      ? authUserDetails?.id
      : "masterFranchiseeId" in masterFranchiseeIdFromParams
      ? (masterFranchiseeIdFromParams?.masterFranchiseeId as unknown as number)
      : null;

  const tableHeaders =
    authUserDetails?.type === "MF Owner" || authUserDetails?.type === "MF Staff"
      ? [
          {
            name: "ID",
            id: "id",
            isRowHeader: true,
          },

          ...commonTableHeaders,
        ]
      : [
          {
            name: "Transaction ID",
            id: "id",
            isRowHeader: true,
          },
          ...commonTableHeaders,
        ];

  const commonQueryArgs: FilterMasterFranchiseePointsTransactionsArgs = useMemo(
    () => ({
      ...queryFieldArgs,
      pagination: { size: watchPageSize },
      filter: watchType
        ? {
            type: {
              isExactly: watchType,
            },
          }
        : undefined,
      globalSearch: undefined,
      sortBy: watchSortBy?.column
        ? {
            column: watchSortBy?.column ?? "id",
            order:
              watchSortBy?.direction === "ascending"
                ? ("ASC" as const)
                : ("DESC" as const),
          }
        : undefined,
      masterFranchiseeId: masterFranchiseeId ? +masterFranchiseeId : undefined,
    }),
    [watchType, watchSortBy?.column, watchSortBy?.direction]
  );

  const { data, loading, fetchMore, refetch } = useQuery(
    FILTER_MASTER_FRANCHISEE_POINTS_TRANSACTIONS,
    {
      variables: commonQueryArgs,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
    }
  );

  const [generateCSV, { loading: csvFileLoading }] = useMutation(
    GENERATE_MF_POINTS_TRANSACTION_CSV
  );

  const pointsAvailable =
    data?.filterMasterFranchiseePointsTransactions?.edges &&
    data?.filterMasterFranchiseePointsTransactions?.edges?.length > 0
      ? data?.filterMasterFranchiseePointsTransactions?.edges[0]?.node
          ?.masterFranchiseePoint?.pointsAvailable
      : null;

  const masterFranchiseePrefix =
    data?.filterMasterFranchiseePointsTransactions?.edges &&
    data?.filterMasterFranchiseePointsTransactions?.edges?.length > 0
      ? data?.filterMasterFranchiseePointsTransactions?.edges[0]?.node
          ?.masterFranchiseePoint?.masterFranchiseeInformation?.prefix
      : null;

  const rows =
    data?.filterMasterFranchiseePointsTransactions?.edges?.map((edge) => ({
      id: edge?.node?.transactionId,
      type:
        edge?.node?.type === "Add points transfer"
          ? "Points Transfer (+)"
          : edge?.node?.type === "Deduct points transfer"
          ? "Points Transfer (-)"
          : edge?.node?.type,
      points:
        edge?.node?.type === "Add points transfer"
          ? `+${
              edge?.node?.points && Number.isInteger(edge?.node?.points)
                ? edge?.node?.points
                : edge?.node?.points && edge?.node?.points?.toFixed(2)
            }`
          : edge?.node?.type === "Deduct points transfer"
          ? `-${
              edge?.node?.points && Number.isInteger(edge?.node?.points)
                ? edge?.node?.points
                : edge?.node?.points && edge?.node?.points?.toFixed(2)
            }`
          : edge?.node?.type === "In"
          ? `+${
              edge?.node?.points && Number.isInteger(edge?.node?.points)
                ? edge?.node?.points
                : edge?.node?.points && edge?.node?.points?.toFixed(2)
            }`
          : edge?.node?.type === "Out"
          ? `-${
              edge?.node?.points && Number.isInteger(edge?.node?.points)
                ? edge?.node?.points
                : edge?.node?.points && edge?.node?.points?.toFixed(2)
            }`
          : edge?.node?.points && Number.isInteger(edge?.node?.points)
          ? edge?.node?.points
          : edge?.node?.points && edge?.node?.points?.toFixed(2),
      date: formatDate(edge?.node?.createdAt, "dd/MM/yyyy"),
      action: "action" as const,
      remarks: edge?.node?.remarks || "There are no remarks available",
    })) || [];

  const onNext = () => {
    const queryArgs = commonQueryArgs;
    queryArgs.globalSearch = watchSearch || undefined;
    queryArgs.pagination = {
      size: watchPageSize,
      after:
        data?.filterMasterFranchiseePointsTransactions?.pageInfo?.endCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterMasterFranchiseePointsTransactions } }
      ) => {
        return { filterMasterFranchiseePointsTransactions };
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
      before:
        data?.filterMasterFranchiseePointsTransactions?.pageInfo?.startCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterMasterFranchiseePointsTransactions } }
      ) => {
        return { filterMasterFranchiseePointsTransactions };
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
      updateQuery: (
        _,
        { fetchMoreResult: { filterMasterFranchiseePointsTransactions } }
      ) => {
        return {
          filterMasterFranchiseePointsTransactions,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount =
    data?.filterMasterFranchiseePointsTransactions?.pageInfo
      ?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterMasterFranchiseePointsTransactions?.pageInfo?.hasNextPage &&
    data?.filterMasterFranchiseePointsTransactions?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterMasterFranchiseePointsTransactions?.pageInfo?.hasPreviousPage &&
    data?.filterMasterFranchiseePointsTransactions?.pageInfo?.startCursor
      ? true
      : false;

  const preLoading = usePreLoading(loading);

  const onSearchChange: (search: string | null | undefined) => void =
    useCallback((search) => {
      const queryArgs = commonQueryArgs;

      queryArgs.globalSearch = search || undefined;

      fetchMore({
        variables: queryArgs,
        updateQuery: (
          _,
          { fetchMoreResult: { filterMasterFranchiseePointsTransactions } }
        ) => {
          return {
            filterMasterFranchiseePointsTransactions,
          };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }, []);

  const [showPurchaseOfPointsModal, setShowPurchaseOfPointsModal] = useState(
    navigateFrom === "order"
  );

  const closePurchaseOfPointsModal = () => {
    if (navigateFrom === "order") {
      navigate({
        to: "/points-management",
        search: {
          navigateFrom: undefined,
        },
      });
    }
    setShowPurchaseOfPointsModal(false);
  };

  const [confirmModal, setConfirmModal] = useState<{
    type: "remarks";
    remarks: string | undefined | null;
  } | null>(null);

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  const generateCSVHandler = () => {
    generateCSV()
      .then((response) => {
        if (
          response?.data?.generateMFPointsTransactionCSV !== null &&
          response?.data?.generateMFPointsTransactionCSV !== undefined &&
          response?.data?.generateMFPointsTransactionCSV?.length > 5
        ) {
          fileDownload(response?.data?.generateMFPointsTransactionCSV);
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
          title={isMasterFranchisee ? "Points" : "TransactionHistory"}
          breadcrumbs={
            isMasterFranchisee
              ? [
                  { name: "Home", to: "/dash-board" },
                  {
                    name: "Points",
                    to: "/points-management",
                  },
                ]
              : [
                  { name: "Home", to: "/dash-board" },
                  {
                    name: "Points",
                    to: "/points-management",
                  },
                  {
                    name: masterFranchiseePrefix ?? "Franchisee ID",
                    to: "/points-management",
                  },
                ]
          }
        />
        {isMasterFranchisee && canPurchasePoints && (
          <Button
            onPress={() => {
              setShowPurchaseOfPointsModal(true);
            }}
            className={
              "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px]"
            }
          >
            <AddIcon />
            PURCHASE POINTS
          </Button>
        )}
      </div>

      <div className="flex flex-wrap justify-center items-center gap-4 w-full">
        <div className="flex justify-center items-center md:justify-start flex-wrap gap-3 flex-1">
          <InputField
            control={control}
            name="search"
            type="search"
            debounceOnChange={onSearchChange}
            variant="small"
            className="min-w-[220px] max-w-[220px]"
          />
          <Combobox
            control={control}
            name={"type"}
            options={[
              "In",
              "Out",
              "Add points transfer",
              "Deduct points transfer",
            ]}
            label="Type"
            variant="small"
            className="min-w-[220px] max-w-[220px]"
            canClear
          />
          <DateField
            control={control}
            name="date"
            label="Date Range"
            type="date-range"
            className="min-w-[330px] max-w-[330px]"
            classNameForDateRangePicker="min-h-[38px]"
            nullable={false}
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
          >
            <DownloadIcon />
            DOWNLOAD CSV
          </Button>
        )}
      </div>
      {isMasterFranchisee && (
        <div className="mt-6 font-sunbird">
          <p className="text-primary-dark text-2xl">Available Points</p>
          <p className="text-[34px] text-black">
            {pointsAvailable && Number.isInteger(pointsAvailable)
              ? pointsAvailable
              : (pointsAvailable && pointsAvailable?.toFixed(2)) || "-"}
          </p>
        </div>
      )}
      <Table
        name="Points"
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
          loading={preLoading}
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
                <Cell className={"px-4 last:px-0"}>
                  {item[column?.id] ? (
                    item[column?.id] === "action" ? (
                      <TableAction
                        type="kebab"
                        items={[{ id: "Remarks" }] as const}
                        onAction={(value) => {
                          if (item?.id) {
                            switch (value?.id) {
                              case "Remarks": {
                                setConfirmModal({
                                  type: "remarks",
                                  remarks: item?.remarks || "-",
                                });
                                break;
                              }

                              default: {
                                break;
                              }
                            }
                          }
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
      {showPurchaseOfPointsModal ? (
        <PurchaseOfPointsModal
          isOpen={showPurchaseOfPointsModal}
          onClose={closePurchaseOfPointsModal}
          masterFranchiseeId={masterFranchiseeId}
          refetch={refetch}
        />
      ) : null}
      {confirmModal?.type === "remarks" ? (
        <RemarksModal
          isOpen={confirmModal?.type === "remarks"}
          onClose={closeConfirmModal}
          value={{ page: "remarks", remarks: confirmModal?.remarks }}
        />
      ) : null}
    </div>
  );
};

export default TransactionHistory;
