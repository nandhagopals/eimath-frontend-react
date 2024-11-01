/* eslint-disable @typescript-eslint/no-explicit-any */
import { Cell, Row } from "react-aria-components";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Body, Head, Table, TableAction } from "components/Table";
import { Button } from "components/Buttons";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { InputField, RadioGroup, Select } from "components/Form";
import { ConfirmModal } from "components/Modal";

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
  monthsWithNumbersForFilter,
  notEmpty,
  numberGenerator,
  somethingWentWrongMessage,
} from "global/helpers";
import DownloadIcon from "global/assets/images/file-download-filled.svg?react";

import {
  PDFShowing,
  ShowPDF,
  royaltyFilterSchema,
  RoyaltyCommonFieldArgs,
  HQRoyaltyFieldArgs,
  FilterHQRoyaltiesArgs,
  HQRoyalty,
  FILTER_HQ_ROYALTIES,
  MasterFranchiseeRoyaltyFieldArgs,
  FilterMasterFranchiseeRoyaltiesArgs,
  MasterFranchiseeRoyalty,
  FILTER_MASTER_FRANCHISEE_ROYALTIES,
  GENERATE_HQ_ROYALTY_CSV,
  GENERATE_MASTER_FRANCHISEE_ROYALTY_CSV,
  CONFIRM_HQ_ROYALTY_PAYMENT,
  CONFIRM_MASTER_FRANCHISEE_ROYALTY_PAYMENT,
} from "modules/Royalties";

const commonQueryFieldArgs: RoyaltyCommonFieldArgs = {
  isEarningNeed: true,
  isRevenueNeed: true,
  isStatusNeed: true,
  isMonthNeed: true,
  isYearNeed: true,
};

const Royalties = () => {
  const canDownloadCSV = useAllowedResource("DownloadRoyalty");
  const navigate = useNavigate();
  const { authUserDetails } = useAuth();
  const isAdminUser = authUserDetails?.type === "User";

  const tableHeaders = [
    { name: "ID", id: "id", isRowHeader: true },
    {
      name: isAdminUser ? "Master Franchisee" : "Franchisee",
      id: isAdminUser ? ("masterFranchiseeId" as const) : "franchiseeId",
    },
    {
      name: isAdminUser ? "Revenue Collected" : "Revenue",
      id: isAdminUser ? "revenue" : "revenue",
    },
    {
      name: isAdminUser ? "HQ Earning" : "Royalties",
      id: isAdminUser ? "earning" : "earning",
    },
    { name: "Status", id: "status" },
    { name: "Actions", id: "action", hideSort: true },
  ];

  const queryFieldArgs: HQRoyaltyFieldArgs | MasterFranchiseeRoyaltyFieldArgs =
    isAdminUser
      ? {
          ...commonQueryFieldArgs,
          isHQRoyaltyMasterFranchiseeInformationNeed: true,
        }
      : {
          ...commonQueryFieldArgs,
          isMasterFranchiseeRoyaltyFranchiseeInformationNeed: true,
        };

  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { control, resetField } = useFormWithZod({
    schema: royaltyFilterSchema,
    defaultValues: {
      pageSize: defaultPageSize,
      sortBy: { column: "id", direction: "descending" },
      month: null,
      search: null,
      year: null,
      accountType: "ALL",
    },
  });

  const [
    watchSearch,
    watchPageSize,
    watchSortBy,
    watchMonth,
    watchYear,
    watchAccountType,
  ] = useWatch({
    control,
    name: ["search", "pageSize", "sortBy", "month", "year", "accountType"],
  });

  const commonQueryArgs:
    | FilterHQRoyaltiesArgs
    | FilterMasterFranchiseeRoyaltiesArgs = useMemo(
    () => ({
      ...queryFieldArgs,
      pagination: { size: watchPageSize },
      globalSearch: undefined,
      sortBy: watchSortBy?.column
        ? {
            column:
              watchSortBy?.column === "masterFranchiseeId"
                ? "masterFranchiseeInformation"
                : watchSortBy?.column === "franchiseeId"
                ? "franchiseeInformation"
                : watchSortBy?.column ?? "id",
            order:
              watchSortBy?.direction === "ascending"
                ? ("ASC" as const)
                : ("DESC" as const),
            subClassField:
              watchSortBy?.column === "masterFranchiseeId"
                ? "masterFranchiseeName"
                : watchSortBy?.column === "franchiseeId"
                ? "franchiseeName"
                : undefined,
          }
        : undefined,
      filter:
        watchMonth || watchYear || watchAccountType
          ? {
              month: watchMonth
                ? {
                    isExactly: monthsWithNumbersForFilter[watchMonth],
                  }
                : undefined,
              year: watchYear
                ? {
                    isExactly: `${watchYear}`,
                  }
                : undefined,
              status:
                watchAccountType === "PAID" || watchAccountType === "UNPAID"
                  ? {
                      isExactly:
                        watchAccountType === "PAID" ? "Paid" : "Unpaid",
                    }
                  : {
                      inArray: ["Paid", "Unpaid", "To process"],
                    },
            }
          : undefined,
    }),
    [
      watchSortBy?.column,
      watchSortBy?.direction,
      watchMonth,
      watchYear,
      watchAccountType,
    ]
  );

  const {
    data: filterHQRoyalties,
    loading: hqRoyaltyLoading,
    fetchMore: fetchMoreHQRoyalty,
    updateQuery: hqRoyaltyUpdateQuery,
    refetch: hqRoyaltyRefetch,
  } = useQuery(FILTER_HQ_ROYALTIES, {
    skip: isAdminUser ? false : true,
    variables: commonQueryArgs,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const {
    data: filterMasterFranchiseeRoyalties,
    loading: masterFranchiseeRoyaltyLoading,
    fetchMore: fetchMoreMasterFranchiseeRoyalty,
    updateQuery: mfRoyaltyUpdateQuery,
    refetch: mfRoyaltyRefetch,
  } = useQuery(FILTER_MASTER_FRANCHISEE_ROYALTIES, {
    skip: isAdminUser ? true : false,
    variables: commonQueryArgs,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const [generateHQRoyaltyCSV, { loading: hqRoyaltyCSVLoading }] = useMutation(
    GENERATE_HQ_ROYALTY_CSV
  );

  const [
    generateMasterFranchiseeRoyaltyCSV,
    { loading: masterFranchiseeRoyaltyCSVLoading },
  ] = useMutation(GENERATE_MASTER_FRANCHISEE_ROYALTY_CSV);

  const [confirmHQRoyaltyPayment, { loading: confirmHQRoyaltyPaymentLoading }] =
    useMutation(CONFIRM_HQ_ROYALTY_PAYMENT);

  const [
    confirmMasterFranchiseeRoyaltyPayment,
    { loading: confirmMasterFranchiseeRoyaltyPaymentLoading },
  ] = useMutation(CONFIRM_MASTER_FRANCHISEE_ROYALTY_PAYMENT);

  const [confirmModal, setConfirmModal] = useState<{
    id: number;
  } | null>(null);

  const [pdfModal, setPDFModal] = useState<ShowPDF | null>(null);

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  const confirmPaidModalHandler = () => {
    if (confirmModal?.id) {
      if (isAdminUser) {
        confirmHQRoyaltyPayment({
          variables: {
            id: confirmModal?.id,
            isStatusNeed: true,
          },
        })
          .then((response) => {
            if (response?.data?.confirmHQRoyaltyPayment) {
              hqRoyaltyUpdateQuery(({ filterHQRoyalties }) => {
                return {
                  filterHQRoyalties: {
                    pageInfo: filterHQRoyalties?.pageInfo,
                    __typename: filterHQRoyalties?.__typename,
                    edges: filterHQRoyalties?.edges?.map((edge) => {
                      if (
                        edge?.node?.id ===
                        response?.data?.confirmHQRoyaltyPayment?.id
                      ) {
                        return {
                          node: {
                            ...edge?.node,
                            status:
                              response?.data?.confirmHQRoyaltyPayment?.status,
                          },
                        };
                      } else {
                        return {
                          node: edge?.node,
                        };
                      }
                    }),
                  },
                };
              });
              setPDFModal({
                showPDF: true,
                modalFrom: "Paid",
                royaltyId: confirmModal?.id,
              });
              setConfirmModal(null);
            } else {
              toastNotification(somethingWentWrongMessage);
            }
          })
          .catch((error) => {
            toastNotification(messageHelper(error));
          });
      } else {
        confirmMasterFranchiseeRoyaltyPayment({
          variables: {
            id: confirmModal?.id,
            isStatusNeed: true,
          },
        })
          .then((response) => {
            if (response?.data?.confirmMasterFranchiseeRoyaltyPayment) {
              mfRoyaltyUpdateQuery(({ filterMasterFranchiseeRoyalties }) => {
                return {
                  filterMasterFranchiseeRoyalties: {
                    pageInfo: filterMasterFranchiseeRoyalties?.pageInfo,
                    __typename: filterMasterFranchiseeRoyalties?.__typename,
                    edges: filterMasterFranchiseeRoyalties?.edges?.map(
                      (edge) => {
                        if (
                          edge?.node?.id ===
                          response?.data?.confirmMasterFranchiseeRoyaltyPayment
                            ?.id
                        ) {
                          return {
                            node: {
                              ...edge?.node,
                              status:
                                response?.data
                                  ?.confirmMasterFranchiseeRoyaltyPayment
                                  ?.status,
                            },
                          };
                        } else {
                          return {
                            node: edge?.node,
                          };
                        }
                      }
                    ),
                  },
                };
              });
              setPDFModal({
                showPDF: true,
                modalFrom: "Paid",
                royaltyId: confirmModal?.id,
              });
              setConfirmModal(null);
            } else {
              toastNotification(somethingWentWrongMessage);
            }
          })
          .catch((error) => {
            toastNotification(messageHelper(error));
          });
      }
    }
  };

  const royalties: (HQRoyalty | MasterFranchiseeRoyalty)[] = filterHQRoyalties
    ?.filterHQRoyalties?.edges
    ? filterHQRoyalties?.filterHQRoyalties?.edges
        ?.map((edge) => edge?.node)
        ?.filter(notEmpty)
    : filterMasterFranchiseeRoyalties?.filterMasterFranchiseeRoyalties?.edges
    ? filterMasterFranchiseeRoyalties?.filterMasterFranchiseeRoyalties?.edges
        ?.map((edge) => edge?.node)
        ?.filter(notEmpty)
    : [];

  const rows =
    royalties?.map((royalty) => ({
      id: royalty?.id,
      masterFranchiseeId:
        "masterFranchiseeInformation" in royalty
          ? {
              masterFranchiseeId: royalty?.masterFranchiseeInformation?.id,
              masterFranchiseeName:
                royalty?.masterFranchiseeInformation?.masterFranchiseeName,
              masterFranchiseePrefix:
                royalty?.masterFranchiseeInformation?.prefix,
            }
          : null,
      franchiseeId:
        "franchiseeInformation" in royalty
          ? {
              franchiseeId: royalty?.franchiseeInformation?.id,
              franchiseeName: royalty?.franchiseeInformation?.franchiseeName,
              franchiseePrefix: royalty?.franchiseeInformation?.prefix,
            }
          : null,
      revenue: isAdminUser
        ? (royalty?.revenue && Math.trunc(royalty?.revenue)) || ""
        : royalty?.revenue
        ? `${
            "masterFranchiseeInformation" in royalty
              ? royalty?.masterFranchiseeInformation?.currency
              : "franchiseeInformation" in royalty
              ? royalty?.franchiseeInformation?.masterFranchiseeInformation
                  ?.currency
              : ""
          } ${Math.trunc(royalty?.revenue)}`
        : "",
      earning: isAdminUser
        ? (royalty?.earning && Math.trunc(royalty?.earning)) || ""
        : royalty?.earning
        ? `${
            "masterFranchiseeInformation" in royalty
              ? royalty?.masterFranchiseeInformation?.currency
              : "franchiseeInformation" in royalty
              ? royalty?.franchiseeInformation?.masterFranchiseeInformation
                  ?.currency
              : ""
          } ${
            Number.isInteger(royalty?.earning)
              ? royalty?.earning
              : royalty?.earning?.toFixed(2)
          }`
        : "",
      status: royalty?.status,
      action: "action" as const,
      month: royalty?.month,
      year: royalty?.year,
    })) || [];

  const onNext = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.globalSearch = watchSearch || undefined;

    queryArgs.pagination = {
      after: isAdminUser
        ? filterHQRoyalties?.filterHQRoyalties?.pageInfo?.endCursor
        : filterMasterFranchiseeRoyalties?.filterMasterFranchiseeRoyalties
            ?.pageInfo?.endCursor,
      size: watchPageSize,
    };

    if (isAdminUser) {
      fetchMoreHQRoyalty({
        variables: queryArgs,
        updateQuery: (_, { fetchMoreResult: { filterHQRoyalties } }) => {
          return { filterHQRoyalties };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    } else {
      fetchMoreMasterFranchiseeRoyalty({
        variables: queryArgs,
        updateQuery: (
          _,
          { fetchMoreResult: { filterMasterFranchiseeRoyalties } }
        ) => {
          return { filterMasterFranchiseeRoyalties };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }
  };

  const onPrev = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.globalSearch = watchSearch || undefined;

    queryArgs.pagination = {
      before: isAdminUser
        ? filterHQRoyalties?.filterHQRoyalties?.pageInfo?.startCursor
        : filterMasterFranchiseeRoyalties?.filterMasterFranchiseeRoyalties
            ?.pageInfo?.startCursor,
      size: watchPageSize,
    };

    if (isAdminUser) {
      fetchMoreHQRoyalty({
        variables: queryArgs,
        updateQuery: (_, { fetchMoreResult: { filterHQRoyalties } }) => {
          return { filterHQRoyalties };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    } else {
      fetchMoreMasterFranchiseeRoyalty({
        variables: queryArgs,
        updateQuery: (
          _,
          { fetchMoreResult: { filterMasterFranchiseeRoyalties } }
        ) => {
          return { filterMasterFranchiseeRoyalties };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }
  };

  const onPageSizeChange: (page: number) => void = (page) => {
    const queryArgs = commonQueryArgs;

    queryArgs.globalSearch = watchSearch || undefined;

    queryArgs.pagination = {
      size: page,
    };

    if (isAdminUser) {
      fetchMoreHQRoyalty({
        variables: queryArgs,
        updateQuery: (_, { fetchMoreResult: { filterHQRoyalties } }) => {
          return { filterHQRoyalties };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    } else {
      fetchMoreMasterFranchiseeRoyalty({
        variables: queryArgs,
        updateQuery: (
          _,
          { fetchMoreResult: { filterMasterFranchiseeRoyalties } }
        ) => {
          return { filterMasterFranchiseeRoyalties };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }
  };

  const totalCount =
    filterHQRoyalties?.filterHQRoyalties?.pageInfo?.totalNumberOfItems ||
    filterMasterFranchiseeRoyalties?.filterMasterFranchiseeRoyalties?.pageInfo
      ?.totalNumberOfItems ||
    0;

  const nextDisabled =
    (filterHQRoyalties?.filterHQRoyalties?.pageInfo?.hasNextPage &&
      filterHQRoyalties?.filterHQRoyalties?.pageInfo?.endCursor) ||
    (filterMasterFranchiseeRoyalties?.filterMasterFranchiseeRoyalties?.pageInfo
      ?.hasNextPage &&
      filterMasterFranchiseeRoyalties?.filterMasterFranchiseeRoyalties?.pageInfo
        ?.endCursor)
      ? true
      : false;

  const prevDisabled =
    (filterHQRoyalties?.filterHQRoyalties?.pageInfo?.hasPreviousPage &&
      filterHQRoyalties?.filterHQRoyalties?.pageInfo?.startCursor) ||
    (filterMasterFranchiseeRoyalties?.filterMasterFranchiseeRoyalties?.pageInfo
      ?.hasPreviousPage &&
      filterMasterFranchiseeRoyalties?.filterMasterFranchiseeRoyalties?.pageInfo
        ?.startCursor)
      ? true
      : false;

  const preLoading = usePreLoading(
    hqRoyaltyLoading || masterFranchiseeRoyaltyLoading
  );

  const onSearchChange: (search: string | null | undefined) => void = (
    search
  ) => {
    const queryArgs = commonQueryArgs;

    queryArgs.globalSearch = search || undefined;

    if (isAdminUser) {
      fetchMoreHQRoyalty({
        variables: queryArgs,
        updateQuery: (_, { fetchMoreResult: { filterHQRoyalties } }) => {
          return { filterHQRoyalties };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    } else {
      fetchMoreMasterFranchiseeRoyalty({
        variables: queryArgs,
        updateQuery: (
          _,
          { fetchMoreResult: { filterMasterFranchiseeRoyalties } }
        ) => {
          return { filterMasterFranchiseeRoyalties };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }
  };

  const kebabMenuList = (
    item: (typeof rows)[number]
  ): {
    id: "View" | "Paid" | "Send Invoice" | "Download PDF" | null;
  }[] => {
    return item?.status === "Paid"
      ? [{ id: "View" }, { id: "Download PDF" }]
      : item?.status === "Unpaid"
      ? [{ id: "View" }, { id: "Paid" }, { id: "Download PDF" }]
      : item?.status?.toLowerCase() === "to process"
      ? [{ id: "View" }, { id: "Send Invoice" }]
      : [{ id: "View" }];
  };

  const kebabMenuAction = (
    value: ReturnType<typeof kebabMenuList>[number]["id"],
    item: (typeof rows)[number]
  ) => {
    if (item?.id) {
      switch (value) {
        case "View": {
          if (isAdminUser && typeof item?.id !== "string" && item?.id) {
            navigate({
              to: "/royalties/master-franchisee/$masterFranchiseeId",
              params: {
                masterFranchiseeId: item?.id,
              },
              search: {
                mfName: item?.masterFranchiseeId?.masterFranchiseeName,
                mfPrefix: item?.masterFranchiseeId?.masterFranchiseePrefix,
              },
            });
          } else {
            navigate({
              to: "/royalties/$royaltyId",
              params: {
                royaltyId: item?.id,
              },
              search: {
                franchiseeName: item?.franchiseeId?.franchiseeName,
                franchiseePrefix: item?.franchiseeId?.franchiseePrefix,
              },
            });
          }
          break;
        }

        case "Paid": {
          if (item?.id) {
            setConfirmModal({
              id: item?.id,
            });
          }

          break;
        }

        case "Send Invoice": {
          if (item?.id) {
            setPDFModal({
              showPDF: true,
              modalFrom: "Send Invoice",
              royaltyId: item?.id,
            });
          }
          break;
        }

        case "Download PDF": {
          if (item?.id) {
            setPDFModal({
              showPDF: true,
              modalFrom: item?.status === "Unpaid" ? "Unpaid" : "Download PDF",
              royaltyId: item?.id,
            });
          }
          break;
        }

        default: {
          break;
        }
      }
    }
  };

  const generateCSVHandler = () => {
    if (isAdminUser) {
      generateHQRoyaltyCSV()
        .then((response) => {
          if (
            response?.data?.generateHQRoyaltyCSV !== null &&
            response?.data?.generateHQRoyaltyCSV !== undefined &&
            response?.data?.generateHQRoyaltyCSV?.length > 5 &&
            !response?.data?.generateHQRoyaltyCSV
              ?.toLowerCase()
              ?.trim()
              ?.replaceAll(" ", "")
              ?.includes("nodatafound")
          ) {
            fileDownload(response?.data?.generateHQRoyaltyCSV);
          } else if (
            response?.data?.generateHQRoyaltyCSV !== null &&
            response?.data?.generateHQRoyaltyCSV !== undefined &&
            response?.data?.generateHQRoyaltyCSV?.length > 5 &&
            response?.data?.generateHQRoyaltyCSV
              ?.toLowerCase()
              ?.trim()
              ?.replaceAll(" ", "")
              ?.includes("nodatafound")
          ) {
            toastNotification([
              {
                messageType: "error",
                message: "No data found",
              },
            ]);
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((error) => {
          toastNotification(messageHelper(error));
        });
    } else {
      generateMasterFranchiseeRoyaltyCSV()
        .then((response) => {
          if (
            response?.data?.generateMasterFranchiseeRoyaltyCSV !== null &&
            response?.data?.generateMasterFranchiseeRoyaltyCSV !== undefined &&
            response?.data?.generateMasterFranchiseeRoyaltyCSV?.length > 5 &&
            !response?.data?.generateMasterFranchiseeRoyaltyCSV
              ?.toLowerCase()
              ?.trim()
              ?.replaceAll(" ", "")
              ?.includes("nodatafound")
          ) {
            fileDownload(response?.data?.generateMasterFranchiseeRoyaltyCSV);
          } else if (
            response?.data?.generateMasterFranchiseeRoyaltyCSV !== null &&
            response?.data?.generateMasterFranchiseeRoyaltyCSV !== undefined &&
            response?.data?.generateMasterFranchiseeRoyaltyCSV?.length > 5 &&
            response?.data?.generateMasterFranchiseeRoyaltyCSV
              ?.toLowerCase()
              ?.trim()
              ?.replaceAll(" ", "")
              ?.includes("nodatafound")
          ) {
            toastNotification([
              {
                messageType: "error",
                message: "No data found",
              },
            ]);
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
    <div className="space-y-6 w-full sm:max-w-6xl py-2">
      <TitleAndBreadcrumb
        title="Royalties"
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Royalties",
            to: "/royalties",
          },
        ]}
      />
      <RadioGroup
        control={control}
        name="accountType"
        options={["ALL", "UNPAID", "PAID"]}
        variant="filled"
        className="flex justify-end"
        onChange={() => {
          resetField("search", { defaultValue: "" });
          resetField("sortBy", {
            defaultValue: { column: "id", direction: "descending" },
          });
        }}
      />
      <div className="flex flex-col flex-wrap sm:flex-row justify-between items-center gap-2">
        <div className="flex flex-col lg:flex-row items-center md:justify-start gap-x-2 gap-y-2 lg:gap-y-0">
          <InputField
            name={"search"}
            control={control}
            debounceOnChange={onSearchChange}
            variant="small"
            type="search"
          />
          <Select
            control={control}
            name="month"
            label="Month"
            options={months}
            variant="small"
            className="min-w-[220px] w-min"
            canClear
          />
          <Select
            control={control}
            name="year"
            label="Year"
            options={numberGenerator(true, 10, "DESC")}
            variant="small"
            className="min-w-[220px] w-min"
            canClear
          />
        </div>
        {canDownloadCSV && totalCount > 0 && (
          <Button
            variant="outlined"
            onPress={generateCSVHandler}
            className={
              "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px] shadow-none"
            }
            loading={hqRoyaltyCSVLoading || masterFranchiseeRoyaltyCSVLoading}
            loadingColor="secondary"
          >
            <DownloadIcon />
            DOWNLOAD CSV
          </Button>
        )}
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
          {(item) => {
            return (
              <Row
                columns={tableHeaders}
                className={"hover:bg-action-hover focus:outline-none"}
              >
                {(column) => {
                  return (
                    <Cell className={"px-4 last:px-0"}>
                      {item[column?.id] ? (
                        item[column?.id] === "action" ? (
                          <TableAction
                            type="kebab"
                            items={kebabMenuList(item)}
                            onAction={(value) => {
                              kebabMenuAction(value?.id ?? null, item);
                            }}
                          />
                        ) : item[column?.id] === "Paid" ||
                          item[column?.id] === "Unpaid" ||
                          item[column?.id] === "To process" ? (
                          <p
                            className={`w-min whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] ${
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
                        ) : column?.id === "masterFranchiseeId" ? (
                          <span>
                            {typeof item?.masterFranchiseeId === "string"
                              ? "-"
                              : item?.masterFranchiseeId?.masterFranchiseeName}
                          </span>
                        ) : column?.id === "franchiseeId" ? (
                          <span>
                            {typeof item?.franchiseeId === "string"
                              ? "-"
                              : item?.franchiseeId?.franchiseeName}
                          </span>
                        ) : (
                          item[column?.id]
                        )
                      ) : (
                        "N/A"
                      )}
                    </Cell>
                  );
                }}
              </Row>
            );
          }}
        </Body>
      </Table>
      {confirmModal?.id && (
        <ConfirmModal
          message={"Confirm Paid?"}
          onClose={closeConfirmModal}
          button={{
            primary: {
              onPress: confirmPaidModalHandler,
              loading:
                confirmHQRoyaltyPaymentLoading ||
                confirmMasterFranchiseeRoyaltyPaymentLoading,
            },
            secondary: {
              onPress: closeConfirmModal,
              isDisabled:
                confirmHQRoyaltyPaymentLoading ||
                confirmMasterFranchiseeRoyaltyPaymentLoading,
            },
          }}
          isOpen={!!confirmModal?.id}
        />
      )}
      {pdfModal?.showPDF && (
        <PDFShowing
          isOpen={pdfModal?.showPDF}
          setPDFModal={setPDFModal}
          pdfModal={pdfModal}
          hqRoyaltyRefetch={hqRoyaltyRefetch}
          mfRoyaltyRefetch={mfRoyaltyRefetch}
        />
      )}
    </div>
  );
};

export default Royalties;
