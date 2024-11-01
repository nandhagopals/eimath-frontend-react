import { Nullish } from "global/types";

type GenerateSalesReportCSVResponse = Nullish<{
  generateSalesReportCSV: string;
}>;

type SalesReport = Nullish<{
  totalAmount: number;
  year: number;
}>;

type FilterSalesReportReturnData = {
  dataCollection: SalesReport[];
  totalNoOfRecords: number;
  totalRevenue: number;
  csvFilePath: string;
};

type FilterSalesReportsResponse = Nullish<{
  filterHQSalesReports: Nullish<FilterSalesReportReturnData>;
  filterMFSalesReports: Nullish<FilterSalesReportReturnData>;
  filterFranchiseeSalesReports: Nullish<FilterSalesReportReturnData>;
}>;

type FilterSalesReportsArgs = {
  fromDate: string;
  toDate: string;
  limit?: number | null;
  page?: number | null;
  isHQUser?: boolean;
  isMFUser?: boolean;
  isFranchiseeUser?: boolean;
  isCSCFilePathNeed?: boolean;
};

export type {
  GenerateSalesReportCSVResponse,
  FilterSalesReportsArgs,
  FilterSalesReportsResponse,
};
