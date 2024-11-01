import { Cell, Row } from "react-aria-components";
import { Form, useWatch } from "react-hook-form";
import { useQuery, useReactiveVar } from "@apollo/client";
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
  FILTER_STUDENT_WITHDRAWN_REPORTS,
  FilterStudentWithdrawnReportArgs,
  withdrawnReportFilterSchema,
} from "modules/Reports/WithdrawnReport";
import StackedBarChart from "modules/Reports/WithdrawnReport/Pages/StackedBarChart";
import { lastDayOfMonth } from "date-fns";
import MasterFranchiseeAndFranchiseeComponent from "modules/Reports/StudentReport/components/MasterFranchiseeAndFranchiseeComponent";

const tableHeaders = [
  { name: "ID", id: "id" as const },
  { name: "Year", id: "year" as const, isRowHeader: true },
  { name: "Withdrawal Count", id: "withdrawalCount" as const },
];

const WithdrawnReport = () => {
  const { authUserDetails } = useAuth();

  const isAdmin = authUserDetails?.type === "User";

  const isMasterFranchisee =
    authUserDetails?.type === "MF Owner" ||
    authUserDetails?.type === "MF Staff";

  const isFranchisee = authUserDetails?.type === "Franchisee";

  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const canDownloadCSV = useAllowedResource("DownloadEducationalCategory");

  const { control } = useFormWithZod({
    schema: withdrawnReportFilterSchema,
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

  const [watchDateRange, watchMasterFranchiseeOrFranchisee] = useWatch({
    control,
    name: ["dateRange", "masterFranchiseeOrFranchisee"],
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

  const commonQueryArgs: FilterStudentWithdrawnReportArgs = {
    fromDate,
    toDate,
    limit: defaultPageSize,
    page: 1,
    franchiseeId: isMasterFranchisee
      ? watchMasterFranchiseeOrFranchisee?.fieldType === "franchisee"
        ? watchMasterFranchiseeOrFranchisee?.id
        : undefined
      : isFranchisee
      ? authUserDetails?.id
      : undefined,
    masterFranchiseeId: isAdmin
      ? watchMasterFranchiseeOrFranchisee?.fieldType === "masterFranchisee"
        ? watchMasterFranchiseeOrFranchisee?.id
        : undefined
      : isMasterFranchisee
      ? authUserDetails?.id
      : undefined,
  };

  const { data, loading, fetchMore } = useQuery(
    FILTER_STUDENT_WITHDRAWN_REPORTS,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        ...commonQueryArgs,
      },
      notifyOnNetworkStatusChange: true,
    }
  );

  const generateCSVHandler = () => {
    if (data?.filterStudentWithdrawnReports?.csvFilePath) {
      fileDownload(data?.filterStudentWithdrawnReports?.csvFilePath);
    } else {
      toastNotification(somethingWentWrongMessage);
    }
  };

  const rows =
    data?.filterStudentWithdrawnReports?.dataCollection?.map(
      (studentReport, index) => {
        return {
          id: index + 1,
          year: studentReport?.year ?? 0,
          withdrawalCount: studentReport?.withdrawnCount,
        };
      }
    ) ?? [];

  const onPrevOrNextHandler = (page: number) => {
    const queryArgs = commonQueryArgs;
    queryArgs.page = page;

    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterStudentWithdrawnReports } }
      ) => {
        return { filterStudentWithdrawnReports };
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
      updateQuery: (
        _,
        { fetchMoreResult: { filterStudentWithdrawnReports } }
      ) => {
        return {
          filterStudentWithdrawnReports,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount = data?.filterStudentWithdrawnReports?.totalNoOfRecords || 0;

  const preLoading = usePreLoading(loading);
  const barChartDataArray =
    data?.filterStudentWithdrawnReports?.educationalTermWiseCount
      ?.map((educationalTermWiseCount) => {
        if (
          educationalTermWiseCount?.year &&
          educationalTermWiseCount?.educationalTerm &&
          educationalTermWiseCount?.withdrawnCount &&
          +educationalTermWiseCount?.withdrawnCount > 0
        ) {
          return {
            year: educationalTermWiseCount?.year,
            [educationalTermWiseCount?.educationalTerm]:
              +educationalTermWiseCount?.withdrawnCount,
          };
        } else {
          return null;
        }
      })
      ?.filter(notEmpty) ?? [];

  const barChartData = Object.values(
    barChartDataArray?.reduce((acc, item) => {
      if (!acc[item.year]) {
        acc[item.year] = { year: item.year };
      }
      Object.keys(item).forEach((key) => {
        if (key !== "year") {
          acc[item.year][key] = item[key];
        }
      });
      return acc;
    }, {})
  ) as unknown as ({ year: number } & { [key: string]: number })[];

  const maxValue =
    barChartDataArray.reduce((max, item) => {
      Object.keys(item).forEach((key) => {
        if (
          key !== "year" &&
          typeof item[key] === "number" &&
          item[key] > max
        ) {
          max = item[key];
        }
      });
      return max;
    }, Number.NEGATIVE_INFINITY) ?? 10;

  return (
    <div className="grid grid-cols-1 max-w-[904px] gap-6 py-2">
      <TitleAndBreadcrumb
        title={"Withdrawn Report"}
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Reports",
            to: "/reports/sales-reports",
          },
          {
            name: "Withdrawn Report",
            to: "/reports/withdrawn-reports",
          },
        ]}
      />
      <Form
        control={control}
        className="bg-white p-8 shadow-card-outline rounded space-y-6"
      >
        <div className="flex justify-between gap-6">
          <p className="text-[34px] font-normal font-sunbird">
            Withdrawn Report{" "}
          </p>
          {canDownloadCSV && totalCount > 0 && (
            <Button
              onPress={generateCSVHandler}
              className={
                "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px]"
              }
              loadingColor="secondary"
            >
              <DownloadIcon />
              DOWNLOAD CSV
            </Button>
          )}
        </div>

        <div className="flex gap-2.5 flex-wrap">
          {!isFranchisee ? (
            <MasterFranchiseeAndFranchiseeComponent
              control={control}
              name="masterFranchiseeOrFranchisee"
              label="Centre"
              className="max-w-60"
              variant="small"
              canClear
              isFranchiseeNeed={isMasterFranchisee ? true : false}
              isMasterFranchiseeNeed={isAdmin ? true : false}
            />
          ) : null}
          <DateField
            control={control}
            label="Date Range"
            name="dateRange"
            className="max-w-96"
            type="date-range"
            variant="small"
            nullable
          />
        </div>
        <div className="shadow-gradient-elevation rounded-2xl p-4 space-y-4">
          <p className="text-2xl font-normal font-sunbird break-words line-clamp-2">
            {watchMasterFranchiseeOrFranchisee?.name ?? ""} Withdrawal Report [
            {formatDate(watchDateRange?.start.toString(), "MMM")}{" "}
            {watchDateRange?.start?.year} to{" "}
            {formatDate(watchDateRange?.end.toString(), "MMM")}{" "}
            {watchDateRange?.end?.year}]
          </p>

          {loading ? (
            <div className="w-full min-h-[250px] rounded  border shimmer-animation" />
          ) : rows?.length > 0 ? (
            <StackedBarChart data={barChartData} maxValue={maxValue} />
          ) : (
            <p className="w-full min-h-[250px] flex justify-center items-center border rounded text-primary-text/40 text-sm">
              No records found...
            </p>
          )}
        </div>
        <hr className="bg-black/[42%]" />

        <Table
          name="Withdrawn Report"
          footer={{
            onNext: onPrevOrNextHandler,
            onPageSizeChange,
            onPrev: onPrevOrNextHandler,
            nextDisabled: true,
            prevDisabled: true,
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

export default WithdrawnReport;
