import { TypedDocumentNode, gql } from "@apollo/client";

import {
  GenerateDashboardReportArgs,
  GenerateDashboardReportResponse,
} from "modules/Dashboard";

const GENERATE_DASHBOARD_REPORT: TypedDocumentNode<
  GenerateDashboardReportResponse,
  GenerateDashboardReportArgs
> = gql`
  query GenerateDashboardReport($year: String!) {
    generateDashboardReport(year: $year) {
      givenYearTotalMF
      previousYearTotalMF
      givenYearTotalFranchisee
      previousYearTotalFranchisee
      givenYearTotalStudents
      previousYearTotalStudents
      givenYearTotalWithdrawnStudents
      previousYearTotalWithdrawnStudents
      masterFranchiseePercentage
      franchiseePercentage
      activeStudentsPercentage
      withdrawnStudentsPercentage
      previousYearTotalRevenue
      givenYearTotalRevenue
      revenuePercentage
      givenYearMonthWiseRevenue {
        month
        totalAmount
      }
      previousYearMonthWiseRevenue {
        month
        totalAmount
      }
    }
  }
`;

export { GENERATE_DASHBOARD_REPORT };
