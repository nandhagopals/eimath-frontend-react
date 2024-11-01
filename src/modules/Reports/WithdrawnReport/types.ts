import { Nullish } from "global/types";

type FilterStudentWithdrawnReportResponse = Nullish<{
  filterStudentWithdrawnReports: Nullish<{
    totalNoOfRecords: number;
    csvFilePath: string;
    dataCollection: Nullish<{
      withdrawnCount: number;
      year: number;
    }>[];
    educationalTermWiseCount: Nullish<{
      year: number;
      withdrawnCount: number;
      educationalTerm: string;
    }>[];
  }>;
}>;

interface FilterStudentWithdrawnReportArgs {
  fromDate: string;
  toDate: string;
  limit: number;
  page: number;
  masterFranchiseeId?: number | null;
  franchiseeId?: number | null;
}

export type {
  FilterStudentWithdrawnReportResponse,
  FilterStudentWithdrawnReportArgs,
};
