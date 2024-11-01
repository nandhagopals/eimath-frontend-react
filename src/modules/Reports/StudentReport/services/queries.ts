import { TypedDocumentNode, gql } from "@apollo/client";

import {
  FilterStudentReportsArgs,
  FilterStudentReportsResponse,
  STUDENT_REPORT_FRAGMENT,
} from "modules/Reports/StudentReport";

const FILTER_STUDENT_REPORTS: TypedDocumentNode<
  FilterStudentReportsResponse,
  FilterStudentReportsArgs
> = gql`
  ${STUDENT_REPORT_FRAGMENT}
  query FilterStudentReports(
    $fromDate: String!
    $toDate: String!
    $limit: Int
    $page: Int
    $masterFranchiseeId: Int
    $franchiseeId: Int
  ) {
    filterStudentReports: generateStudentReport(
      fromDate: $fromDate
      toDate: $toDate
      limit: $limit
      page: $page
      masterFranchiseeId: $masterFranchiseeId
      franchiseeId: $franchiseeId
    ) {
      dataCollection {
        ...studentReportFragment
      }
      totalNoOfRecords
      csvFilePath
    }
  }
`;

export { FILTER_STUDENT_REPORTS };
