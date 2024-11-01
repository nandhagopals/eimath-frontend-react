import { TypedDocumentNode, gql } from "@apollo/client";

import {
  FilterSalesReportsArgs,
  FilterSalesReportsResponse,
  SALES_REPORT_FRAGMENT,
} from "modules/Reports/SalesReport";

const FILTER_SALES_REPORTS: TypedDocumentNode<
  FilterSalesReportsResponse,
  FilterSalesReportsArgs
> = gql`
  ${SALES_REPORT_FRAGMENT}
  query FilterSalesReports(
    $fromDate: String!
    $toDate: String!
    $limit: Int
    $page: Int
    $isHQUser: Boolean = false
    $isMFUser: Boolean = false
    $isFranchiseeUser: Boolean = false
    $isCSCFilePathNeed: Boolean = false
  ) {
    filterHQSalesReports: generateHQSalesReport(
      fromDate: $fromDate
      toDate: $toDate
      limit: $limit
      page: $page
    ) @include(if: $isHQUser) {
      dataCollection {
        ...salesReportFragment
      }
      totalNoOfRecords
      totalRevenue
      csvFilePath @include(if: $isCSCFilePathNeed)
    }
    filterMFSalesReports: generateMFSalesReport(
      fromDate: $fromDate
      toDate: $toDate
      limit: $limit
      page: $page
    ) @include(if: $isMFUser) {
      dataCollection {
        ...salesReportFragment
      }
      totalNoOfRecords
      totalRevenue
      csvFilePath @include(if: $isCSCFilePathNeed)
    }
    filterFranchiseeSalesReports: generateSalesReport(
      fromDate: $fromDate
      toDate: $toDate
      limit: $limit
      page: $page
    ) @include(if: $isFranchiseeUser) {
      dataCollection {
        ...salesReportFragment
      }
      totalNoOfRecords
      totalRevenue
      csvFilePath @include(if: $isCSCFilePathNeed)
    }
  }
`;

export { FILTER_SALES_REPORTS };
