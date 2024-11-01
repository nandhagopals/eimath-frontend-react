import { Nullish } from "global/types";

type GenerateStudentReportCSVResponse = Nullish<{
  generateStudentReportCSV: string;
}>;

type StudentReport = Nullish<{
  month: string;
  year: number;
  totalNewStudents: number;
  totalDiscontinuedStudents: number;
  totalActiveStudents: number;
  totalGraduatedStudents: number;
}>;

type FilterStudentReportsResponse = Nullish<{
  filterStudentReports: Nullish<{
    dataCollection: StudentReport[];
    totalNoOfRecords: number;
    csvFilePath: string;
  }>;
}>;

type FilterStudentReportsArgs = {
  fromDate: string;
  toDate: string;
  limit?: number | null;
  page?: number | null;
  masterFranchiseeId?: number | null;
  franchiseeId?: number | null;
};

export type {
  StudentReport,
  GenerateStudentReportCSVResponse,
  FilterStudentReportsResponse,
  FilterStudentReportsArgs,
};
