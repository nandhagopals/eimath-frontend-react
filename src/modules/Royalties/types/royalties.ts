import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterFloat,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

import { Franchisee } from "modules/Franchisee";
import { MasterFranchiseeInformation } from "modules/MasterFranchisee";
import { Student } from "modules/Students";

interface RoyaltyCommonFields {
  id: number;
  revenue: number;
  earning: number;
  status: "Paid" | "Unpaid" | "To process" | "Deleted";
  month: string;
  year: string;
  paymentId: string;
  receiptId: string;
  paymentSummaryURL: string;
  receiptURL: string;
  paidAt: string;
}

interface RoyaltyCommonFieldArgs {
  isRevenueNeed?: boolean;
  isEarningNeed?: boolean;
  isStatusNeed?: boolean;
  isMonthNeed?: boolean;
  isYearNeed?: boolean;
  isPaymentIdNeed?: boolean;
  isReceiptIdNeed?: boolean;
  isPaymentSummaryURLNeed?: boolean;
  isReceiptURLNeed?: boolean;
}

interface RoyaltyCommonFilterInput {
  id: FilterInteger;
  month: FilterString;
  year: FilterString;
  status: FilterString;
  earning: FilterFloat;
  revenue: FilterFloat;
}

type HQRoyalty = Nullish<
  RoyaltyCommonFields & {
    masterFranchiseeInformation: MasterFranchiseeInformation;
  }
>;

type HQRoyaltyFieldArgs = Nullish<
  RoyaltyCommonFieldArgs & {
    isHQRoyaltyMasterFranchiseeInformationNeed: boolean;
  }
>;

type HQRoyaltyFilterInput = Nullish<
  RoyaltyCommonFilterInput & {
    masterFranchiseeId: FilterInteger;
  }
>;

type FilterHQRoyaltiesResponse = Nullish<{
  filterHQRoyalties: CursorPaginationReturnType<HQRoyalty>;
}>;

type FilterHQRoyaltiesArgs = CursorPaginationArgs<
  HQRoyaltyFilterInput,
  | "id"
  | "masterFranchiseeInformation"
  | "franchiseeInformation"
  | "revenue"
  | "earning"
  | "status"
> &
  HQRoyaltyFieldArgs;

type MasterFranchiseeRoyaltyTransaction = Nullish<{
  id: number;
  revenue: number;
  earning: number;
  month: string;
  year: string;
  masterFranchiseeRoyalty: {
    franchiseeInformation: Franchisee;
    status: "Paid" | "Unpaid" | "To process" | "Deleted";
  };
  student: Student;
}>;

type MasterFranchiseeRoyalty = Nullish<
  RoyaltyCommonFields & {
    franchiseeInformation: Franchisee;
    masterFranchiseeRoyaltyTransactions: MasterFranchiseeRoyaltyTransaction[];
  }
>;

type MasterFranchiseeRoyaltyFieldArgs = Nullish<
  RoyaltyCommonFieldArgs & {
    isMasterFranchiseeRoyaltyFranchiseeInformationNeed: boolean;
    isMasterFranchiseeRoyaltyMasterFranchiseeRoyaltyTransactionsNeed: boolean;
  }
>;

type MasterFranchiseeRoyaltyFilterInput = Nullish<
  RoyaltyCommonFilterInput & {
    franchiseeId: FilterInteger;
    masterFranchiseeId: FilterInteger;
  }
>;

type FilterMasterFranchiseeRoyaltiesResponse = Nullish<{
  filterMasterFranchiseeRoyalties: CursorPaginationReturnType<MasterFranchiseeRoyalty>;
}>;

type FilterMasterFranchiseeRoyaltiesArgs = CursorPaginationArgs<
  MasterFranchiseeRoyaltyFilterInput,
  | "id"
  | "masterFranchiseeInformation"
  | "franchiseeInformation"
  | "revenue"
  | "earning"
  | "status"
> &
  MasterFranchiseeRoyaltyFieldArgs;

interface GenerateRoyaltyReceiptPDFResponse {
  generateRoyaltyReceiptPdf: Nullish<{
    filePath: string;
    fileName: string;
  }>;
}

interface GenerateRoyaltyReceiptPDFArgs {
  masterFranchiseeRoyaltyId?: number | null;
  hqRoyaltyId?: null;
}

interface GenerateRoyaltyPaymentSummaryPDFResponse {
  generateRoyaltyPaymentSummaryPdf: Nullish<{
    filePath: string;
    fileName: string;
  }>;
}

interface GenerateRoyaltyPaymentSummaryPDFArgs {
  hqRoyaltyId?: number | null;
  masterFranchiseeRoyaltyId?: number | null;
}

type FilterMasterFranchiseeRoyaltiesByMFResponse = Nullish<{
  filterMasterFranchiseeRoyaltiesByMF: {
    dataCollection: CursorPaginationReturnType<MasterFranchiseeRoyalty>;
    totalFranchisee: number;
    totalReceipts: number;
    totalRoyaltiesCollected: number;
    totalEarnings: number;
  };
}>;

type MasterFranchiseeRoyaltyByMFFilterInput = Nullish<{
  id: FilterInteger;
  month: FilterString;
  status: FilterString;
  year: FilterString;
  masterFranchiseeInformationId: number;
}>;

type FilterMasterFranchiseeRoyaltiesByMFArgs = CursorPaginationArgs<
  MasterFranchiseeRoyaltyByMFFilterInput,
  "id" | "franchiseeInformation" | "revenue" | "status" | "monthOrYear"
> &
  MasterFranchiseeRoyaltyFieldArgs & {
    hqRoyaltyId: number;
  };

type FilterMasterFranchiseeRoyaltyTransactionsFieldArgs = Nullish<{
  isMonthNeed: boolean;
  isYearNeed: boolean;
  isRevenueNeed: boolean;
  isMasterFranchiseeRoyaltyNeed: boolean;
  isStudentNeed: boolean;
}>;

type MasterFranchiseeRoyaltyTransactionsFilterInput = Nullish<{
  id: FilterInteger;
  month: FilterString;
  status: FilterString;
  year: FilterString;
  masterFranchiseeRoyaltyId: FilterInteger;
}>;

type FilterMasterFranchiseeRoyaltyTransactionsResponse = Nullish<{
  filterMasterFranchiseeRoyaltyTransactions: CursorPaginationReturnType<MasterFranchiseeRoyaltyTransaction>;
}>;

type FilterMasterFranchiseeRoyaltyTransactionsArgs = CursorPaginationArgs<
  MasterFranchiseeRoyaltyTransactionsFilterInput,
  "id" | "franchiseeInformation" | "revenue" | "status" | "monthOrYear"
> &
  FilterMasterFranchiseeRoyaltyTransactionsFieldArgs;

export type {
  HQRoyalty,
  HQRoyaltyFieldArgs,
  HQRoyaltyFilterInput,
  FilterHQRoyaltiesResponse,
  FilterHQRoyaltiesArgs,
  MasterFranchiseeRoyalty,
  MasterFranchiseeRoyaltyFieldArgs,
  MasterFranchiseeRoyaltyFilterInput,
  FilterMasterFranchiseeRoyaltiesResponse,
  FilterMasterFranchiseeRoyaltiesArgs,
  MasterFranchiseeRoyaltyTransaction,
  RoyaltyCommonFieldArgs,
  FilterMasterFranchiseeRoyaltiesByMFResponse,
  FilterMasterFranchiseeRoyaltiesByMFArgs,
  GenerateRoyaltyReceiptPDFArgs,
  GenerateRoyaltyReceiptPDFResponse,
  GenerateRoyaltyPaymentSummaryPDFResponse,
  GenerateRoyaltyPaymentSummaryPDFArgs,
  MasterFranchiseeRoyaltyTransactionsFilterInput,
  FilterMasterFranchiseeRoyaltyTransactionsResponse,
  FilterMasterFranchiseeRoyaltyTransactionsFieldArgs,
  FilterMasterFranchiseeRoyaltyTransactionsArgs,
};
