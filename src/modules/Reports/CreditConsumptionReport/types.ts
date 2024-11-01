import { Nullish } from "global/types";

type CreditConsumptionReport = Nullish<{
  id: number;
  booksOrCenters: string;
  bgk: number;
  pgl: number;
  sgk: number;
  total: number;
}>;

type CreditConsumptionReportFieldArgs = Nullish<{
  isEducationalTermNeed: boolean;
  isFranchiseeWiseStudentCountNeed: boolean;
  isTotalStudentCountNeed: boolean;
}>;

type FilterCreditConsumptionReportsResponse = Nullish<{
  filterCreditConsumptionReports: {
    dataCollection: {
      educationalTerm: string;
      totalStudentCount: number;
      franchiseeWiseStudentCount: {
        franchisee: string;
        studentCount: number;
      }[];
    }[];
    totalNoOfRecords: number;
    csvFilePath: string;
  };
}>;

type FilterCreditConsumptionReportsArgs = {
  limit?: number;
  page?: number;
  date: string;
  generateCSV: boolean;
} & CreditConsumptionReportFieldArgs;

type GenerateCreditConsumptionReportCSVResponse = Nullish<{
  generateCreditConsumptionReportCSV: string;
}>;

export type {
  FilterCreditConsumptionReportsArgs,
  FilterCreditConsumptionReportsResponse,
  CreditConsumptionReport,
  GenerateCreditConsumptionReportCSVResponse,
  CreditConsumptionReportFieldArgs,
};
