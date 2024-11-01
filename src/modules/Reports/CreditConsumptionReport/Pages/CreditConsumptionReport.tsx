import { Cell, Row } from "react-aria-components";
import { today, getLocalTimeZone } from "@internationalized/date";
import { Form, useWatch } from "react-hook-form";
import { useLazyQuery, useQuery, useReactiveVar } from "@apollo/client";
import { z } from "zod";

import { Button } from "components/Buttons";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { Body, Head, Table } from "components/Table";

import DownloadIcon from "global/assets/images/file-download-filled.svg?react";
import { paginationDefaultCount, toastNotification } from "global/cache";
import {
  dateFieldSchema,
  fileDownload,
  messageHelper,
  removeDuplicates,
  somethingWentWrongMessage,
} from "global/helpers";
import { useAllowedResource, useFormWithZod, usePreLoading } from "global/hook";
import { DateField } from "components/Form";

import {
  FILTER_CREDIT_CONSUMPTION_REPORTS,
  FilterCreditConsumptionReportsArgs,
} from "modules/Reports/CreditConsumptionReport";

const CreditConsumptionReport = () => {
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const canDownloadCSV = useAllowedResource("ReadForecastReportInformation");

  const { control } = useFormWithZod({
    schema: z.object({
      date: dateFieldSchema,
      pageSize: z.number(),
    }),
    defaultValues: {
      pageSize: defaultPageSize,
      date: today(getLocalTimeZone()),
    },
  });

  const [watchDate] = useWatch({
    control,
    name: ["date"],
  });

  const commonQueryArgs: FilterCreditConsumptionReportsArgs = {
    limit: 5,
    page: 1,
    date: watchDate
      .set({
        day: 1,
      })
      .toString(),
    generateCSV: false,
    isEducationalTermNeed: true,
    isFranchiseeWiseStudentCountNeed: true,
    isTotalStudentCountNeed: true,
  };

  const {
    data: filterCreditConsumptionReports,
    loading,
    fetchMore,
  } = useQuery(FILTER_CREDIT_CONSUMPTION_REPORTS, {
    fetchPolicy: "cache-and-network",
    variables: {
      ...commonQueryArgs,
    },
    notifyOnNetworkStatusChange: true,
  });

  const [generateCSVFile, { loading: generateCSVFileLoading }] = useLazyQuery(
    FILTER_CREDIT_CONSUMPTION_REPORTS,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        ...commonQueryArgs,
      },
      notifyOnNetworkStatusChange: true,
    }
  );

  const generateCSVHandler = () => {
    generateCSVFile({
      variables: {
        ...commonQueryArgs,
        generateCSV: true,
      },
    })
      .then((response) => {
        if (response?.data?.filterCreditConsumptionReports?.csvFilePath) {
          fileDownload(
            response?.data?.filterCreditConsumptionReports?.csvFilePath
          );
        } else if (response?.error?.message) {
          toastNotification([
            {
              messageType: "error",
              message: response?.error?.message,
            },
          ]);
        } else {
          toastNotification(somethingWentWrongMessage);
        }
      })
      .catch((error) => {
        toastNotification(messageHelper(error));
      });
  };

  const franchiseeArray =
    filterCreditConsumptionReports?.filterCreditConsumptionReports?.dataCollection
      ?.map((data) => data?.franchiseeWiseStudentCount)
      ?.map((franchisee) => franchisee)
      ?.flat()
      ?.map((franchisee) => franchisee?.franchisee) || [];

  const removeDuplicateFranchisee = removeDuplicates(franchiseeArray);

  const franchiseeForTableHeaders =
    removeDuplicateFranchisee?.map((franchisee) => ({
      name: franchisee,
      id: franchisee,
    })) || [];

  const tableHeaders = [
    { name: "Books\\Centres", id: "booksOrCenters", isRowHeader: true },
    ...franchiseeForTableHeaders,
    { name: "Total", id: "total" },
  ];

  const rows =
    filterCreditConsumptionReports?.filterCreditConsumptionReports?.dataCollection?.map(
      (foreCastReport, index) => {
        const franchiseeWiseCountForEducationalTerm = {};

        for (const franchisee of removeDuplicateFranchisee) {
          franchiseeWiseCountForEducationalTerm[franchisee] =
            foreCastReport?.franchiseeWiseStudentCount?.find(
              (foreCastReport) => foreCastReport?.franchisee === franchisee
            )
              ? foreCastReport?.franchiseeWiseStudentCount?.find(
                  (foreCastReport) => foreCastReport?.franchisee === franchisee
                )?.studentCount || 0
              : 0;
        }

        return {
          id: index + 1,
          booksOrCenters: foreCastReport?.educationalTerm,
          ...franchiseeWiseCountForEducationalTerm,
          total: foreCastReport?.totalStudentCount,
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
        { fetchMoreResult: { filterCreditConsumptionReports } }
      ) => {
        return { filterCreditConsumptionReports };
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
        { fetchMoreResult: { filterCreditConsumptionReports } }
      ) => {
        return {
          filterCreditConsumptionReports,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount =
    filterCreditConsumptionReports?.filterCreditConsumptionReports
      ?.totalNoOfRecords || 0;

  const preLoading = usePreLoading(loading);

  return (
    <div className="grid grid-cols-1 max-w-[904px] gap-6 py-2">
      <TitleAndBreadcrumb
        title={"Forecast Report"}
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Reports",
            to: "/reports/forecast-reports",
          },
          {
            name: "Forecast Report",
            to: "/reports/forecast-reports",
          },
        ]}
      />
      <Form
        control={control}
        className="bg-white p-8 shadow-card-outline rounded space-y-6"
      >
        <div className="flex justify-between gap-6">
          <p className="text-[34px] font-normal font-sunbird">
            Forecast Report
          </p>
          {canDownloadCSV && (
            <Button
              onPress={generateCSVHandler}
              className={
                "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px]"
              }
              isDisabled={loading || generateCSVFileLoading}
              loadingColor="secondary"
              loading={generateCSVFileLoading}
            >
              <DownloadIcon />
              DOWNLOAD CSV
            </Button>
          )}
        </div>
        <DateField
          control={control}
          label="Date"
          name="date"
          className="w-min"
          variant="small"
          nullable
        />
        <Table
          name="Forecast Report"
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
                  <Cell className={"p-4"}>{item?.[column?.id] ?? "N/A"}</Cell>
                )}
              </Row>
            )}
          </Body>
        </Table>
      </Form>
    </div>
  );
};

export default CreditConsumptionReport;
