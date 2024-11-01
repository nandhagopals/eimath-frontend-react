import { z } from "zod";

import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  DateTime,
  FilterDate,
  FilterFloat,
  FilterInteger,
  Nullish,
} from "global/types";

import { MasterFranchiseeInformation } from "modules/MasterFranchisee";
import {
  MasterFranchiseePointsTransaction,
  pointsTransferFormSchema,
} from "modules/PointsManagement";
import { Franchisee } from "modules/Franchisee";

type MasterFranchiseePointsTransactions = Nullish<{
  createdAt: DateTime;
  franchiseeInformation: Franchisee;
  id: number;
  masterFranchiseePoint: MasterFranchiseePoint;
  paymentMethod: string;
  points: number;
  transactionId: string;
  type: string;
  updatedAt: DateTime;
}>;

type MasterFranchiseePoint = Nullish<{
  createdAt: DateTime;
  id: number;
  masterFranchiseeInformation: MasterFranchiseeInformation;
  masterFranchiseePointsTransactions: MasterFranchiseePointsTransactions;
  pointsAvailable: number;
  updatedAt: DateTime;
}>;

type MasterFranchiseePointsFieldArgs = Nullish<{
  isMasterFranchiseeInformationNeed: boolean;
  isPointsAvailableNeed: boolean;
  isUpdateAtNeed: boolean;
  isMasterFranchiseePointsTransactionsNeed: boolean;
}>;

type MasterFranchiseePointsFilterInput = Nullish<{
  id: FilterInteger;
  pointsAvailable: FilterFloat;
  masterFranchiseeId: FilterInteger;
  createdAt: FilterDate;
  updatedAt: FilterDate;
}>;

type FilterMasterFranchiseePointsResponse = Nullish<{
  filterMasterFranchiseePoints: CursorPaginationReturnType<MasterFranchiseePoint>;
}>;

type FilterMasterFranchiseePointsArgs = CursorPaginationArgs<
  MasterFranchiseePointsFilterInput,
  "id" | "masterFranchiseeInformation" | "pointsAvailable" | "updatedAt"
> &
  MasterFranchiseePointsFieldArgs;

type CreateMasterFranchiseePointsTransactionResponse = Nullish<{
  createMasterFranchiseePointsTransaction: MasterFranchiseePointsTransaction;
}>;

interface CreateMasterFranchiseePointsTransactionArgs {
  type: string;
  points: number;
  masterFranchiseeInformationId: number;
  remarks?: string | null;
}

type PointsTransferForm = z.infer<typeof pointsTransferFormSchema>;

export type {
  MasterFranchiseePoint,
  MasterFranchiseePointsFieldArgs,
  MasterFranchiseePointsFilterInput,
  FilterMasterFranchiseePointsResponse,
  FilterMasterFranchiseePointsArgs,
  CreateMasterFranchiseePointsTransactionResponse,
  CreateMasterFranchiseePointsTransactionArgs,
  PointsTransferForm,
};
