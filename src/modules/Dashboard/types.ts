import { Nullish } from "global/types";

type DashboardReport = Nullish<{
  givenYearTotalMF: number;
  previousYearTotalMF: number;
  givenYearTotalFranchisee: number;
  previousYearTotalFranchisee: number;
  givenYearTotalStudents: number;
  previousYearTotalStudents: number;
  givenYearTotalWithdrawnStudents: number;
  previousYearTotalWithdrawnStudents: number;
  masterFranchiseePercentage: number;
  franchiseePercentage: number;
  activeStudentsPercentage: number;
  withdrawnStudentsPercentage: number;
  previousYearTotalRevenue: number;
  givenYearTotalRevenue: number;
  revenuePercentage: number;
  givenYearMonthWiseRevenue: Nullish<{
    month: string;
    totalAmount: number;
  }>[];
  previousYearMonthWiseRevenue: Nullish<{
    month: string;
    totalAmount: number;
  }>[];
}>;

interface GenerateDashboardReportResponse {
  generateDashboardReport?: DashboardReport | null;
}

interface GenerateDashboardReportArgs {
  year: string;
}

export type {
  DashboardReport,
  GenerateDashboardReportResponse,
  GenerateDashboardReportArgs,
};
