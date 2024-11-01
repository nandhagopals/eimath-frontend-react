import { TypedDocumentNode, gql } from "@apollo/client";

import {
  FilterStudentWithdrawnReportArgs,
  FilterStudentWithdrawnReportResponse,
} from "modules/Reports/WithdrawnReport";

const FILTER_STUDENT_WITHDRAWN_REPORTS: TypedDocumentNode<
  FilterStudentWithdrawnReportResponse,
  FilterStudentWithdrawnReportArgs
> = gql`
  query FilterStudentWithdrawnReport(
    $fromDate: String!
    $toDate: String!
    $limit: Int
    $masterFranchiseeId: Int
    $page: Int
    $franchiseeId: Int
  ) {
    filterStudentWithdrawnReports: generateStudentWithdrawnReport(
      fromDate: $fromDate
      toDate: $toDate
      limit: $limit
      masterFranchiseeId: $masterFranchiseeId
      page: $page
      franchiseeId: $franchiseeId
    ) {
      csvFilePath
      dataCollection {
        withdrawnCount
        year
      }
      educationalTermWiseCount {
        year
        withdrawnCount
        educationalTerm
      }
      totalNoOfRecords
    }
  }
`;

export { FILTER_STUDENT_WITHDRAWN_REPORTS };
