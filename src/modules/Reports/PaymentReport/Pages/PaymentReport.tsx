import { Form, useWatch } from "react-hook-form";
import { useQuery, useReactiveVar } from "@apollo/client";
import { Cell, Row } from "react-aria-components";
import { today, getLocalTimeZone } from "@internationalized/date";

import { Button } from "components/Buttons";
import { Select } from "components/Form";
import { Body, Head, Table } from "components/Table";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";

import DownloadIcon from "global/assets/images/file-download-filled.svg?react";
import { paginationDefaultCount, toastNotification } from "global/cache";
import {
  combineClassName,
  fileDownload,
  formatDate,
  messageHelper,
  months,
  monthsWithNumbersForFilter,
  monthsWithStringForFilter,
  numberGenerator,
  somethingWentWrongMessage,
} from "global/helpers";
import { useAllowedResource, useFormWithZod, usePreLoading } from "global/hook";

import {
  paymentReportFilterSchema,
  FilterPaymentReportsArgs,
  FILTER_PAYMENT_REPORTS,
} from "modules/Reports/PaymentReport";
import PieChart from "modules/Reports/PaymentReport/Pages/PieChart";

const tableHeaders = [
  { name: "ID", id: "id" as const, isRowHeader: true },
  { name: "Master Franchisee", id: "masterFranchisee" as const },
  { name: "Invoice ID", id: "invoiceId" as const },
  {
    name: "Bill Date",
    id: "billDate" as const,
  },
  { name: "Amount Due", id: "amountDue" as const },
  { name: "Status", id: "status" as const },
];

const PaymentReport = () => {
  const defaultPageSize = useReactiveVar(paginationDefaultCount);
  const canDownloadCSV = useAllowedResource("DownloadPaymentReport");

  const generateCSVHandler = () => {
    if (data?.filterPaymentReports?.csvFilePath) {
      fileDownload(data?.filterPaymentReports?.csvFilePath);
    } else {
      toastNotification(somethingWentWrongMessage);
    }
  };

  const { control } = useFormWithZod({
    schema: paymentReportFilterSchema,
    defaultValues: {
      pageSize: defaultPageSize,
      month: monthsWithStringForFilter[today(getLocalTimeZone())?.month]?.long,
      year: today(getLocalTimeZone())?.year,
    },
  });

  const [watchMonth, watchYear, watchSortBy] = useWatch({
    control,
    name: ["month", "year", "sortBy"],
  });

  const commonQueryArgs: FilterPaymentReportsArgs = {
    pagination: { size: defaultPageSize },
    sortBy: watchSortBy?.column
      ? {
          column:
            watchSortBy?.column === "invoiceNo"
              ? "invoiceId"
              : watchSortBy?.column === "amountDue"
              ? ""
              : watchSortBy?.column === "billDate"
              ? ""
              : watchSortBy?.column === "dueDate"
              ? "dueDate"
              : watchSortBy?.column ?? "id",
          order:
            watchSortBy?.direction === "ascending"
              ? ("ASC" as const)
              : ("DESC" as const),
        }
      : undefined,
    month: `${watchYear}-${monthsWithNumbersForFilter[watchMonth]}`,
  };

  const { data, loading, fetchMore } = useQuery(FILTER_PAYMENT_REPORTS, {
    variables: commonQueryArgs,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const rows =
    data?.filterPaymentReports?.dataCollection?.edges?.map((edge) => ({
      id: edge?.node?.id,
      masterFranchisee:
        edge?.node?.orderingPartyName ??
        edge?.node?.orderingPartyStudent?.masterFranchiseeInformation
          ?.masterFranchiseeName ??
        edge?.node?.orderingPartyMF?.masterFranchiseeName ??
        edge?.node?.orderingPartyFranchisee?.masterFranchiseeInformation
          ?.masterFranchiseeName,
      invoiceId: edge?.node?.invoiceId,
      billDate: formatDate(edge?.node?.createdAt, "yyyy-MMM-dd"),
      amountDue:
        edge?.node?.total && Number.isInteger(edge?.node?.total)
          ? edge?.node?.total
          : edge?.node?.total && edge?.node?.total?.toFixed(2),
      status: edge?.node?.status,
    })) || [];

  const onNext = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.pagination = {
      after: data?.filterPaymentReports?.dataCollection?.pageInfo?.endCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterPaymentReports } }) => {
        return { filterPaymentReports };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPrev = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.pagination = {
      before: data?.filterPaymentReports?.dataCollection?.pageInfo?.startCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterPaymentReports } }) => {
        return { filterPaymentReports };
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
      updateQuery: (_, { fetchMoreResult: { filterPaymentReports } }) => {
        return {
          filterPaymentReports,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount =
    data?.filterPaymentReports?.dataCollection?.pageInfo?.totalNumberOfItems ||
    0;
  const nextDisabled =
    data?.filterPaymentReports?.dataCollection?.pageInfo?.hasNextPage &&
    data?.filterPaymentReports?.dataCollection?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterPaymentReports?.dataCollection?.pageInfo?.hasPreviousPage &&
    data?.filterPaymentReports?.dataCollection?.pageInfo?.startCursor
      ? true
      : false;

  const preLoading = usePreLoading(loading);

  const paidAmount = data?.filterPaymentReports?.paidAmount ?? 0;
  const unpaidAmount = data?.filterPaymentReports?.unpaidAmount ?? 0;

  return (
    <div className="grid grid-cols-1 max-w-[904px] gap-6 py-2">
      <TitleAndBreadcrumb
        title={"Payment Report"}
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Reports",
            to: "/reports/sales-reports",
          },
          {
            name: "Payment Report",
            to: "/reports/payment-reports",
          },
        ]}
      />
      <Form
        control={control}
        className="bg-white p-8 shadow-card-outline rounded space-y-6"
      >
        <div className="flex justify-between gap-6">
          <p className="text-[34px] font-normal font-sunbird">Payment Report</p>
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
        <div className="flex justify-end gap-2.5 flex-wrap">
          <Select
            control={control}
            name="month"
            label="Month"
            options={months}
            variant="small"
            className="min-w-[196px] lg:min-w-[220px] w-min"
          />
          <Select
            control={control}
            name="year"
            label="Year"
            options={numberGenerator(true, 10, "DESC")}
            variant="small"
            className="min-w-[196px] lg:min-w-[220px] w-min"
          />
        </div>
        <div className="shadow-card-light w-min">
          <div className="space-y-0.5 p-6">
            <p className="text-base font-normal font-roboto text-black">
              Total Outstanding
            </p>
            <p className="text-[34px] font-normal font-sunbird text-primary-main">
              {preLoading
                ? "Loading..."
                : (data?.filterPaymentReports?.unpaidAmount &&
                  Number.isInteger(data?.filterPaymentReports?.unpaidAmount)
                    ? data?.filterPaymentReports?.unpaidAmount
                    : data?.filterPaymentReports?.unpaidAmount &&
                      data?.filterPaymentReports?.unpaidAmount?.toFixed(2)) ??
                  "-"}
            </p>
            <p className="text-xs font-normal text-[#4F4F4F]">
              <span>Paid</span>{" "}
              <span>
                {preLoading
                  ? "Loading..."
                  : (data?.filterPaymentReports?.paidAmount &&
                    Number.isInteger(data?.filterPaymentReports?.paidAmount)
                      ? data?.filterPaymentReports?.paidAmount
                      : data?.filterPaymentReports?.paidAmount &&
                        data?.filterPaymentReports?.paidAmount?.toFixed(2)) ||
                    "0"}
              </span>
            </p>
          </div>
          <hr className="border-[#F0F0F0]" />

          {loading ? (
            <div className="min-w-[320px] min-h-[280px] shimmer-animation" />
          ) : paidAmount > 0 && unpaidAmount > 0 ? (
            <PieChart
              data={[
                { status: "Paid", value: paidAmount },
                { status: "Unpaid", value: unpaidAmount },
              ]}
            />
          ) : (
            <p className="min-w-[320px] min-h-[280px] flex justify-center items-center text-primary-text/40 text-sm">
              No records found...
            </p>
          )}
        </div>
        <hr className="bg-black/[42%]" />
        <Table
          name="Payment Report"
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
                    {item?.[column?.id] ? (
                      column?.id === "status" ? (
                        item?.status ? (
                          <p
                            className={combineClassName(
                              "px-2.5 py-2 rounded-full flex justify-center items-center w-min",
                              item?.status === "Unpaid" ||
                                item?.status === "Canceled"
                                ? "bg-error-main text-white"
                                : "",
                              item?.status === "Paid"
                                ? "bg-success-main text-white"
                                : ""
                            )}
                          >
                            {item?.status}
                          </p>
                        ) : (
                          "N/A"
                        )
                      ) : (
                        item?.[column?.id]
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
      </Form>
    </div>
  );
};

export default PaymentReport;
