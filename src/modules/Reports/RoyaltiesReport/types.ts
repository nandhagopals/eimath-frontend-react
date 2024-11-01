import {
  CursorPaginationReturnType,
  Nullish,
  PaginationArgs,
  SortBy,
} from "global/types";
import { HQRoyalty, MasterFranchiseeRoyalty } from "modules/Royalties";

type GenerateRoyaltiesReportCSVResponse = Nullish<{
  generateRoyaltiesReportCSV: string;
}>;

interface HQRoyaltyReportResponse {
  generateHQRoyaltyReport?: {
    dataCollection?: CursorPaginationReturnType<HQRoyalty> | null;
    totalRevenue?: number | null;
    csvFilePath?: string | null;
  };
}

interface HQRoyaltyReportArgs {
  fromDate: string;
  toDate: string;
  // masterFranchiseeId?: number | undefined;
  sortBy?: SortBy | null;
  pagination: PaginationArgs;
}

interface MFRoyaltyReportResponse {
  generateMFRoyaltyReport?: {
    dataCollection?: CursorPaginationReturnType<MasterFranchiseeRoyalty> | null;
    totalRevenue?: number | null;
    csvFilePath?: string | null;
  };
}

interface MFRoyaltyReportArgs {
  fromDate: string;
  toDate: string;
  // franchiseeId?: number | null;
  sortBy?: SortBy | null;
  pagination: PaginationArgs;
}

export type {
  GenerateRoyaltiesReportCSVResponse,
  HQRoyaltyReportResponse,
  HQRoyaltyReportArgs,
  MFRoyaltyReportResponse,
  MFRoyaltyReportArgs,
};
