import { z } from "zod";

import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  DateTime,
  FilterFloat,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

import {
  paymentMethodSchema,
  purchaseOfPointsFormSchema,
} from "modules/PointsManagement";
import { MasterFranchiseeInformation } from "modules/MasterFranchisee";

type MasterFranchiseePoints = Nullish<{
  createdAt: DateTime;
  id: number;
  masterFranchiseeInformation: MasterFranchiseeInformation;
  masterFranchiseePointsTransactions: MasterFranchiseePointsTransaction[];
  pointsAvailable: number;
  updatedAt: DateTime;
}>;

type MasterFranchiseePointsTransaction = Nullish<{
  createdAt: DateTime;
  id: number;
  masterFranchiseePoint: MasterFranchiseePoints;
  paymentMethod: string;
  points: number;
  transactionId: string;
  type: "In" | "Out" | "Add points transfer" | "Deduct points transfer";
  updatedAt: DateTime;
  remarks: string;
}>;

type MasterFranchiseePointsTransactionsFieldArgs = Nullish<{
  isTypeNeed: boolean;
  isPointsNeed: boolean;
  isCreatedAtNeed: boolean;
  isRemarksNeed: boolean;
  isMasterFranchiseePointNeed: boolean;
}>;

type MasterFranchiseePointsTransactionsFilterInput = Nullish<{
  id: FilterInteger;
  masterFranchiseePointId: FilterInteger;
  paymentMethod: FilterString;
  points: FilterFloat;
  transactionId: FilterString;
  type: FilterString;
}>;

type FilterMasterFranchiseePointsTransactionsResponse = Nullish<{
  filterMasterFranchiseePointsTransactions: CursorPaginationReturnType<MasterFranchiseePointsTransaction>;
}>;

type FilterMasterFranchiseePointsTransactionsArgs = CursorPaginationArgs<
  MasterFranchiseePointsTransactionsFilterInput,
  "id" | "franchiseeId" | "type" | "points" | "date"
> & {
  masterFranchiseeId?: number | null;
} & MasterFranchiseePointsTransactionsFieldArgs;

type PaymentMethod = z.infer<typeof paymentMethodSchema>;

type MasterFranchiseePointsPurchase = Nullish<{
  createdAt: DateTime;
  id: number;
  masterFranchiseeInformation: MasterFranchiseeInformation;
  numberOfPoints: number;
  paymentMethod: PaymentMethod;
  totalPayable: number;
  updatedAt: DateTime;
}>;

interface CreateMasterFranchiseePointsPurchaseResponse {
  createMasterFranchiseePointsPurchase: MasterFranchiseePointsPurchase;
}

interface CreateMasterFranchiseePointsPurchaseArgs {
  masterFranchiseeInformationId: number;
  numberOfPoints: number;
}

interface UpdateMasterFranchiseePointsPurchaseResponse {
  updateMasterFranchiseePointsPurchase: MasterFranchiseePointsPurchase;
}

interface UpdateMasterFranchiseePointsPurchaseArg {
  id: number;
  paymentMethod: string;
}

interface DeleteMasterFranchiseePointsPurchaseResponse {
  deleteMasterFranchiseePointsPurchase: string;
}
interface DeleteMasterFranchiseePointsPurchaseArg {
  id: number;
}

type PurchaseOfPointsForm = z.infer<typeof purchaseOfPointsFormSchema>;

type MakeOnlinePaymentResponse = Nullish<{
  makeOnlinePayment: Nullish<{
    id: number;
    paymentURL: string;
  }>;
}>;

interface MakeOnlinePaymentArgs {
  masterFranchiseePointsPurchaseId: number;
}

interface GetMFPointsPurchasePaymentMethodResponse {
  getMFPointsPurchasePaymentMethod?: PaymentMethod[] | null;
}

export type {
  MasterFranchiseePointsTransactionsFieldArgs,
  MasterFranchiseePointsTransactionsFilterInput,
  FilterMasterFranchiseePointsTransactionsResponse,
  FilterMasterFranchiseePointsTransactionsArgs,
  CreateMasterFranchiseePointsPurchaseResponse,
  CreateMasterFranchiseePointsPurchaseArgs,
  PurchaseOfPointsForm,
  MasterFranchiseePoints,
  MasterFranchiseePointsTransaction,
  UpdateMasterFranchiseePointsPurchaseResponse,
  UpdateMasterFranchiseePointsPurchaseArg,
  DeleteMasterFranchiseePointsPurchaseResponse,
  DeleteMasterFranchiseePointsPurchaseArg,
  MakeOnlinePaymentResponse,
  MakeOnlinePaymentArgs,
  GetMFPointsPurchasePaymentMethodResponse,
};
