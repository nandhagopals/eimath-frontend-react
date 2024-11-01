import { Form, useWatch } from "react-hook-form";
import { useQuery, useReactiveVar } from "@apollo/client";
import { Cell, Row } from "react-aria-components";
import { lastDayOfMonth } from "date-fns";
import { today, getLocalTimeZone } from "@internationalized/date";

import { Button } from "components/Buttons";
import { DateField } from "components/Form";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { Body, Head, Table } from "components/Table";

import DownloadIcon from "global/assets/images/file-download-filled.svg?react";
import { paginationDefaultCount, toastNotification } from "global/cache";
import {
  fileDownload,
  formatDate,
  messageHelper,
  notEmpty,
  somethingWentWrongMessage,
} from "global/helpers";
import {
  useAllowedResource,
  useAuth,
  useFormWithZod,
  usePreLoading,
} from "global/hook";

import {
  HQRoyaltyReportArgs,
  HQ_ROYALTY_REPORT,
  MFRoyaltyReportArgs,
  MF_ROYALTY_REPORT,
  royaltiesReportFilterSchema,
} from "modules/Reports/RoyaltiesReport";
import BarChart from "modules/Reports/RoyaltiesReport/Pages/BarChart";
import { HQRoyalty, MasterFranchiseeRoyalty } from "modules/Royalties";

const tableHeaders = [
  { name: "ID", id: "id" as const, isRowHeader: true },
  { name: "Name", id: "name" as const, hideSort: true },
  { name: "Short Name", id: "shortName" as const, hideSort: true },
  { name: "Date", id: "date" as const },
  { name: "Amount", id: "amount" as const },
];

const RoyaltiesReport = () => {
  const defaultPageSize = useReactiveVar(paginationDefaultCount);
  const canDownloadCSV = useAllowedResource("DownloadEducationalCategory");
  const { authUserDetails } = useAuth();
  const isAdmin = authUserDetails?.type === "User";
  const isMasterFranchisee =
    authUserDetails?.type === "MF Owner" ||
    authUserDetails?.type === "MF Staff";

  const { control } = useFormWithZod({
    schema: royaltiesReportFilterSchema,
    defaultValues: {
      pageSize: defaultPageSize,
      dateRange: {
        end: today(getLocalTimeZone()).set({
          month: 12,
          day: 1,
        }),
        start: today(getLocalTimeZone()).set({
          month: 1,
          day: 1,
        }),
      },
    },
  });

  const [watchDateRange, watchSortBy] = useWatch({
    control,
    name: ["dateRange", "sortBy"],
  });

  const fromDate = watchDateRange?.start
    .set({
      day: 1,
    })
    .toString();

  const toDate = formatDate(
    lastDayOfMonth(
      watchDateRange?.end?.toDate(getLocalTimeZone())
    )?.toISOString(),
    "yyyy-MM-dd"
  )!;

  const commonQueryArgs: HQRoyaltyReportArgs | MFRoyaltyReportArgs = {
    pagination: { size: defaultPageSize },
    sortBy: watchSortBy?.column
      ? {
          column:
            watchSortBy?.column === "amount"
              ? "revenue"
              : watchSortBy?.column === "date"
              ? "paidAt"
              : watchSortBy?.column ?? "id",
          order:
            watchSortBy?.direction === "ascending"
              ? ("ASC" as const)
              : ("DESC" as const),
        }
      : undefined,
    // masterFranchiseeId: isAdmin ? authUserDetails?.id : undefined,
    // franchiseeId: isMasterFranchisee ? authUserDetails?.id : undefined,
    fromDate,
    toDate,
  };

  const {
    data: hqRoyaltyReport,
    loading: hqRoyaltyReportLoading,
    fetchMore: hqRoyaltyReportFetchMore,
  } = useQuery(HQ_ROYALTY_REPORT, {
    variables: commonQueryArgs,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const {
    data: mfRoyaltyReport,
    loading: mfRoyaltyReportLoading,
    fetchMore: mfRoyaltyReportFetchMore,
  } = useQuery(MF_ROYALTY_REPORT, {
    variables: commonQueryArgs,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const csvFilePath = isAdmin
    ? hqRoyaltyReport?.generateHQRoyaltyReport?.csvFilePath
    : mfRoyaltyReport?.generateMFRoyaltyReport?.csvFilePath;

  // const csvFilePath = hqRoyaltyReport?.generateHQRoyaltyReport?.csvFilePath;

  const generateCSVHandler = () => {
    if (csvFilePath) {
      fileDownload(csvFilePath);
    } else {
      toastNotification(somethingWentWrongMessage);
    }
  };

  const data: (HQRoyalty | MasterFranchiseeRoyalty)[] = isAdmin
    ? hqRoyaltyReport?.generateHQRoyaltyReport?.dataCollection?.edges
        ?.map((edge) => edge?.node)
        ?.filter(notEmpty) ?? []
    : isMasterFranchisee
    ? mfRoyaltyReport?.generateMFRoyaltyReport?.dataCollection?.edges
        ?.map((edge) => edge?.node)
        ?.filter(notEmpty) ?? []
    : [];

  const rows =
    data
      ?.map((royaltyReport) => {
        if (royaltyReport?.id) {
          return {
            id: royaltyReport?.id,
            name: isAdmin
              ? "masterFranchiseeInformation" in royaltyReport
                ? royaltyReport?.masterFranchiseeInformation
                    ?.masterFranchiseeName
                : null
              : isMasterFranchisee
              ? "franchiseeInformation" in royaltyReport
                ? royaltyReport?.franchiseeInformation?.franchiseeName
                : null
              : null,
            shortName: isAdmin
              ? "masterFranchiseeInformation" in royaltyReport
                ? royaltyReport?.masterFranchiseeInformation?.prefix
                : null
              : isMasterFranchisee
              ? "franchiseeInformation" in royaltyReport
                ? royaltyReport?.franchiseeInformation?.prefix
                : null
              : null,
            date: royaltyReport?.paidAt,
            amount:
              royaltyReport?.revenue && Number.isInteger(royaltyReport?.revenue)
                ? royaltyReport?.revenue
                : royaltyReport?.revenue && royaltyReport?.revenue?.toFixed(2),
            year: royaltyReport?.year,
          };
        } else {
          return null;
        }
      })
      ?.filter(notEmpty) ??
    ([] || []);

  const onNext = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.pagination = {
      after: isAdmin
        ? hqRoyaltyReport?.generateHQRoyaltyReport?.dataCollection?.pageInfo
            ?.endCursor
        : isMasterFranchisee
        ? mfRoyaltyReport?.generateMFRoyaltyReport?.dataCollection?.pageInfo
            ?.endCursor
        : null,
    };

    if (isAdmin) {
      hqRoyaltyReportFetchMore({
        variables: queryArgs,
        updateQuery: (_, { fetchMoreResult: { generateHQRoyaltyReport } }) => {
          return { generateHQRoyaltyReport };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }

    if (isMasterFranchisee) {
      mfRoyaltyReportFetchMore({
        variables: queryArgs,
        updateQuery: (_, { fetchMoreResult: { generateMFRoyaltyReport } }) => {
          return { generateMFRoyaltyReport };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }
  };

  const onPrev = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.pagination = {
      before: isAdmin
        ? hqRoyaltyReport?.generateHQRoyaltyReport?.dataCollection?.pageInfo
            ?.startCursor
        : isMasterFranchisee
        ? mfRoyaltyReport?.generateMFRoyaltyReport?.dataCollection?.pageInfo
            ?.startCursor
        : null,
    };

    if (isAdmin) {
      hqRoyaltyReportFetchMore({
        variables: queryArgs,
        updateQuery: (_, { fetchMoreResult: { generateHQRoyaltyReport } }) => {
          return { generateHQRoyaltyReport };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }

    if (isMasterFranchisee) {
      mfRoyaltyReportFetchMore({
        variables: queryArgs,
        updateQuery: (_, { fetchMoreResult: { generateMFRoyaltyReport } }) => {
          return { generateMFRoyaltyReport };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }
  };

  const onPageSizeChange: (page: number) => void = (page) => {
    const queryArgs = commonQueryArgs;

    queryArgs.pagination = {
      size: page,
    };

    if (isAdmin) {
      hqRoyaltyReportFetchMore({
        variables: queryArgs,
        updateQuery: (_, { fetchMoreResult: { generateHQRoyaltyReport } }) => {
          return { generateHQRoyaltyReport };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }

    if (isMasterFranchisee) {
      mfRoyaltyReportFetchMore({
        variables: queryArgs,
        updateQuery: (_, { fetchMoreResult: { generateMFRoyaltyReport } }) => {
          return { generateMFRoyaltyReport };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }
  };

  const totalCount = isAdmin
    ? hqRoyaltyReport?.generateHQRoyaltyReport?.dataCollection?.pageInfo
        ?.totalNumberOfItems || 0
    : mfRoyaltyReport?.generateMFRoyaltyReport?.dataCollection?.pageInfo
        ?.totalNumberOfItems || 0;
  const nextDisabled = isAdmin
    ? hqRoyaltyReport?.generateHQRoyaltyReport?.dataCollection?.pageInfo
        ?.hasNextPage &&
      hqRoyaltyReport?.generateHQRoyaltyReport?.dataCollection?.pageInfo
        ?.endCursor
      ? true
      : false
    : mfRoyaltyReport?.generateMFRoyaltyReport?.dataCollection?.pageInfo
        ?.hasNextPage &&
      mfRoyaltyReport?.generateMFRoyaltyReport?.dataCollection?.pageInfo
        ?.endCursor
    ? true
    : false;
  const prevDisabled = isAdmin
    ? hqRoyaltyReport?.generateHQRoyaltyReport?.dataCollection?.pageInfo
        ?.hasPreviousPage &&
      hqRoyaltyReport?.generateHQRoyaltyReport?.dataCollection?.pageInfo
        ?.startCursor
      ? true
      : false
    : mfRoyaltyReport?.generateMFRoyaltyReport?.dataCollection?.pageInfo
        ?.hasPreviousPage &&
      mfRoyaltyReport?.generateMFRoyaltyReport?.dataCollection?.pageInfo
        ?.startCursor
    ? true
    : false;

  const preLoading = usePreLoading(
    mfRoyaltyReportLoading || hqRoyaltyReportLoading
  );

  const totalRevenue = isAdmin
    ? hqRoyaltyReport?.generateHQRoyaltyReport?.totalRevenue ?? 0
    : mfRoyaltyReport?.generateMFRoyaltyReport?.totalRevenue ?? 0;

  const getYearlyTotal = (data: { year: number; amount: number }[]) => {
    if (data?.length > 0) {
      const yearTotals = {};

      for (const item of data) {
        const year = item.year;
        if (yearTotals[year]) {
          yearTotals[year] += item.amount;
        } else {
          yearTotals[year] = item.amount;
        }
      }

      return yearTotals
        ? Object.entries(yearTotals)
            ?.map(([key, value]) => {
              if (key && !Number.isNaN(+key)) {
                return {
                  year: +key,
                  amount: value as number,
                };
              } else {
                return null;
              }
            })
            ?.filter(notEmpty)
        : [];
    } else {
      return [];
    }
  };

  const chartData =
    rows
      ?.map((data) =>
        data?.year &&
        !Number?.isNaN(+data?.year) &&
        data?.amount &&
        +data?.amount > 0
          ? { year: +data?.year, amount: data?.amount }
          : null
      )
      ?.filter(notEmpty) ?? [];

  return (
    <div className="grid grid-cols-1 max-w-[904px] gap-6 py-2">
      <TitleAndBreadcrumb
        title={"Royalties"}
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Reports",
            to: "/reports/sales-reports",
          },
          {
            name: "Royalties Report",
            to: "/reports/royalties-reports",
          },
        ]}
      />
      <Form
        control={control}
        className="bg-white p-8 shadow-card-outline rounded space-y-7"
      >
        <div className="flex justify-between gap-6">
          <p className="text-[34px] font-normal font-sunbird">
            Royalties Report
          </p>
          {canDownloadCSV && totalCount > 0 && (
            <Button
              onPress={generateCSVHandler}
              className={
                "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px]"
              }
              isDisabled={preLoading}
            >
              <DownloadIcon />
              DOWNLOAD CSV
            </Button>
          )}
        </div>
        <DateField
          control={control}
          label="Date Range"
          name="dateRange"
          className="max-w-96"
          type="date-range"
          variant="small"
          nullable={false}
        />
        <div className="shadow-gradient-elevation rounded-2xl p-4 space-y-4">
          <div>
            <p className="text-2xl font-normal font-sunbird text-primary-dark">
              Total Royalties Revenue
            </p>
            <p className="text-[34px] font-normal font-sunbird">
              {totalRevenue && Number.isInteger(totalRevenue)
                ? totalRevenue
                : (totalRevenue && totalRevenue?.toFixed(2)) || "0"}
            </p>
          </div>

          {preLoading ? (
            <div className="min-w-[320px] min-h-[280px] shimmer-animation" />
          ) : chartData && chartData?.length > 0 ? (
            <BarChart
              data={getYearlyTotal(
                chartData?.map((data) => {
                  return {
                    ...data,
                    amount: (data?.amount && +data?.amount) || 0,
                  };
                })
              )}
            />
          ) : (
            <p className="min-w-[320px] min-h-[280px] flex justify-center items-center text-primary-text/40 text-sm">
              No records found...
            </p>
          )}
        </div>
        <hr className="bg-black/[42%]" />
        <Table
          name="Royalties Report"
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
          parentClassName={"border-none"}
        >
          <Head headers={tableHeaders} />
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
                key={item?.id}
                columns={tableHeaders}
                className={"hover:bg-action-hover focus:outline-none"}
              >
                {(column) => {
                  return (
                    <Cell className={"p-4"}>
                      {column?.id && item?.[column?.id]
                        ? column?.id === "date"
                          ? item?.date && formatDate(item?.date, "dd/MM/yyyy")
                            ? formatDate(item?.date, "dd/MM/yyyy")
                            : "N/A"
                          : item?.[column?.id] ?? "N/A"
                        : "N/A"}
                    </Cell>
                  );
                }}
              </Row>
            )}
          </Body>
        </Table>
      </Form>
    </div>
  );
};

export default RoyaltiesReport;
