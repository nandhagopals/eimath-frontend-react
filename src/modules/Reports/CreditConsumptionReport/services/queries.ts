import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CREDIT_CONSUMPTION_REPORT_FRAGMENT,
  FilterCreditConsumptionReportsArgs,
  FilterCreditConsumptionReportsResponse,
} from "modules/Reports/CreditConsumptionReport";

const FILTER_CREDIT_CONSUMPTION_REPORTS: TypedDocumentNode<
  FilterCreditConsumptionReportsResponse,
  FilterCreditConsumptionReportsArgs
> = gql`
  ${CREDIT_CONSUMPTION_REPORT_FRAGMENT}
  query FilterCreditConsumptionReports(
    $limit: Int
    $page: Int
    $date: String!
    $generateCSV: Boolean = false
    $isEducationalTermNeed: Boolean = false
    $isFranchiseeWiseStudentCountNeed: Boolean = false
    $isTotalStudentCountNeed: Boolean = false
  ) {
    filterCreditConsumptionReports: generateForecastReport(
      limit: $limit
      page: $page
      date: $date
      generateCSV: $generateCSV
    ) {
      dataCollection {
        ...creditConsumptionReportFragment
      }
      totalNoOfRecords
      csvFilePath
    }
  }
`;

export { FILTER_CREDIT_CONSUMPTION_REPORTS };
