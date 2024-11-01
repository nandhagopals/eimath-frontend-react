import { Form, useWatch } from "react-hook-form";
import { useLazyQuery, useQuery, useReactiveVar } from "@apollo/client";
import { Cell, Row } from "react-aria-components";
import { today, getLocalTimeZone } from "@internationalized/date";
import { lastDayOfMonth } from "date-fns";

import { Button } from "components/Buttons";
import { DateField } from "components/Form";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { Body, Head, Table } from "components/Table";

import DownloadIcon from "global/assets/images/file-download-filled.svg?react";
import { paginationDefaultCount, toastNotification } from "global/cache";
import {
  formatDate,
  messageHelper,
  notEmpty,
  validateAndDownloadFile,
} from "global/helpers";
import { useAuth, useFormWithZod, usePreLoading } from "global/hook";

import {
  FILTER_SALES_REPORTS,
  FilterSalesReportsArgs,
  salesReportFilterSchema,
} from "modules/Reports/SalesReport";
import BarChart from "modules/Reports/SalesReport/Pages/BarChart";
import { FILTER_MASTER_FRANCHISEE_INFORMATION } from "modules/MasterFranchisee";
import { FILTER_FRANCHISEES } from "modules/Franchisee";

const tableHeaders = [
  { name: "ID", id: "id" as const, isRowHeader: true },
  { name: "Year", id: "year" as const },
  { name: "Amount", id: "totalAmount" as const },
];

const SalesReport = () => {
  const { authUserDetails } = useAuth();
  const isMasterFranchisee =
    authUserDetails?.type === "MF Owner" ||
    authUserDetails?.type === "MF Staff";
  const isAdmin = authUserDetails?.type === "User";
  const isFranchisee = authUserDetails?.type === "Franchisee";

  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { control } = useFormWithZod({
    schema: salesReportFilterSchema,
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

  const [watchDateRange] = useWatch({
    control,
    name: ["dateRange"],
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

  const commonQueryArgs: FilterSalesReportsArgs = {
    fromDate,
    toDate,
    limit: defaultPageSize,
    page: 1,
    isHQUser: isAdmin,
    isMFUser: isMasterFranchisee,
    isFranchiseeUser: isFranchisee,
  };

  const { data, loading, fetchMore } = useQuery(FILTER_SALES_REPORTS, {
    fetchPolicy: "cache-and-network",
    variables: {
      ...commonQueryArgs,
    },
    notifyOnNetworkStatusChange: true,
  });

  const [fetchCSVFile, { loading: csvFileLoading }] = useLazyQuery(
    FILTER_SALES_REPORTS,
    {
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    }
  );

  const { data: mfDetailsData, loading: mfDetailsDataLoading } = useQuery(
    FILTER_MASTER_FRANCHISEE_INFORMATION,
    {
      variables: {
        isMasterFranchiseeInformationCurrencyNeed: true,
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      skip: !isMasterFranchisee,
    }
  );

  const { data: franchiseeDetailsData, loading: franchiseeDetailsDataLoading } =
    useQuery(FILTER_FRANCHISEES, {
      variables: {
        isFranchiseeMasterFranchiseeInformationNeed: true,
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      skip: !isFranchisee,
    });

  const generateCSVHandler = () => {
    fetchCSVFile({
      variables: {
        ...commonQueryArgs,
        isCSCFilePathNeed: true,
      },
    })
      .then(({ data }) => {
        validateAndDownloadFile(
          isAdmin
            ? data?.filterHQSalesReports?.csvFilePath
            : isMasterFranchisee
            ? data?.filterMFSalesReports?.csvFilePath
            : data?.filterFranchiseeSalesReports?.csvFilePath
        );
      })
      .catch((error) => {
        toastNotification(messageHelper(error));
      });
  };

  const getRowsData = (
    salesReportData?:
      | {
          totalAmount?: number | null | undefined;
          year?: number | null | undefined;
        }[]
      | null
      | undefined
  ) => {
    return (
      salesReportData
        ?.map((salesReport, index) => {
          if (
            typeof salesReport?.year === "number" &&
            typeof salesReport?.totalAmount === "number"
          ) {
            return {
              id: index + 1,
              year: salesReport?.year ?? 0,
              totalAmount:
                (salesReport?.totalAmount &&
                Number.isInteger(salesReport?.totalAmount)
                  ? salesReport?.totalAmount
                  : salesReport?.totalAmount &&
                    salesReport?.totalAmount?.toFixed(2)) ?? 0,
            };
          } else {
            return null;
          }
        })
        ?.filter(notEmpty) ?? []
    );
  };

  const rows = isAdmin
    ? getRowsData(data?.filterHQSalesReports?.dataCollection)
    : isMasterFranchisee
    ? getRowsData(data?.filterMFSalesReports?.dataCollection)
    : isFranchisee
    ? getRowsData(data?.filterFranchiseeSalesReports?.dataCollection)
    : [];

  const onPrevOrNextHandler = (page: number) => {
    const queryArgs = commonQueryArgs;
    queryArgs.page = page;

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, fetchMoreResult) => {
        return fetchMoreResult?.fetchMoreResult;
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPageSizeChange: (pageSize: number) => void = (pageSize) => {
    const queryArgs = commonQueryArgs;
    queryArgs.limit = pageSize;

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, fetchMoreResult) => {
        return fetchMoreResult?.fetchMoreResult;
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount = isAdmin
    ? data?.filterHQSalesReports?.totalNoOfRecords || 0
    : isMasterFranchisee
    ? data?.filterMFSalesReports?.totalNoOfRecords || 0
    : data?.filterFranchiseeSalesReports?.totalNoOfRecords || 0;

  const preLoading = usePreLoading(
    loading || mfDetailsDataLoading || franchiseeDetailsDataLoading
  );

  const totalRevenue = isAdmin
    ? data?.filterHQSalesReports?.totalRevenue
    : isMasterFranchisee
    ? data?.filterMFSalesReports?.totalRevenue
    : data?.filterFranchiseeSalesReports?.totalRevenue;

  const currencySymbol = isAdmin
    ? "$"
    : isMasterFranchisee
    ? mfDetailsData?.filterMasterFranchiseeInformation?.edges?.[0]?.node
        ?.currency ?? ""
    : isFranchisee
    ? franchiseeDetailsData?.filterFranchisees?.edges?.[0]?.node
        ?.masterFranchiseeInformation?.currency
    : "";

  return (
    <div className="grid grid-cols-1 max-w-[904px] gap-6 py-2">
      <TitleAndBreadcrumb
        title={"Sales Volume"}
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Reports",
            to: "/reports/sales-reports",
          },
          {
            name: "Sales Report",
            to: "/reports/sales-reports",
          },
        ]}
      />
      <Form
        control={control}
        className="bg-white p-8 shadow-card-outline rounded space-y-7"
      >
        <div className="flex justify-between gap-6">
          <p className="text-[34px] font-normal font-sunbird">Sales Report</p>

          {totalCount > 0 && (
            <Button
              onPress={generateCSVHandler}
              className={
                "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px]"
              }
              isDisabled={preLoading || csvFileLoading}
              loading={csvFileLoading}
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
          nullable
        />
        <div className="shadow-gradient-elevation rounded-2xl p-4 space-y-4">
          <div>
            <p className="text-2xl font-normal font-sunbird text-primary-dark">
              Total Revenue
            </p>
            <p className="text-[34px] font-normal font-sunbird">
              {preLoading
                ? "Loading..."
                : `${currencySymbol} ${
                    totalRevenue && Number.isInteger(totalRevenue)
                      ? totalRevenue
                      : (totalRevenue && totalRevenue?.toFixed(2)) ?? "0"
                  }`}
            </p>
          </div>
          {loading ? (
            <div className="w-full min-h-[250px] rounded  border shimmer-animation" />
          ) : rows?.length > 0 ? (
            <BarChart
              data={rows?.map((data) => {
                return {
                  ...data,
                  totalAmount: (data?.totalAmount && +data?.totalAmount) || 0,
                };
              })}
            />
          ) : (
            <p className="w-full min-h-[250px] flex justify-center items-center border rounded text-primary-text/40 text-sm">
              No records found...
            </p>
          )}
        </div>
        <hr className="bg-black/[42%]" />
        <Table
          name="Sales Report"
          footer={{
            onNext: onPrevOrNextHandler,
            onPageSizeChange,
            onPrev: onPrevOrNextHandler,
            nextDisabled: false,
            prevDisabled: false,
            control,
            noOfItem: rows?.length ?? 0,
            isNonCursorPage: true,
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
                  <Cell className={"p-4"}>
                    {item?.[column?.id] ? item?.[column?.id] : "N/A"}
                  </Cell>
                )}
              </Row>
            )}
          </Body>
        </Table>
      </Form>
    </div>
  );
};

export default SalesReport;
