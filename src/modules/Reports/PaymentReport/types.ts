import {
  Nullish,
  PaginationArgs,
  PaginationInfoReturnType,
  SortBy,
} from "global/types";

import { Invoice } from "modules/Students";

type GeneratePaymentReportCSVResponse = Nullish<{
  generatePaymentReportCSV: string;
}>;

type PaymentReport = Invoice;

type FilterPaymentReportsResponse = Nullish<{
  filterPaymentReports?: {
    dataCollection?: {
      edges?:
        | {
            node?: PaymentReport | null;
          }[]
        | null;
      pageInfo?: PaginationInfoReturnType | null;
    } | null;
    paidAmount?: number | null;
    unpaidAmount?: number | null;
    csvFilePath?: string | null;
  } | null;
}>;

type FilterPaymentReportsArgs = {
  month: string;
  sortBy: SortBy<string> | undefined | null;
  pagination: PaginationArgs | undefined | null;
};

export type {
  GeneratePaymentReportCSVResponse,
  FilterPaymentReportsResponse,
  FilterPaymentReportsArgs,
};
