import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterFloat,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

type MasterFranchiseeGeneral = Nullish<{
  id: number;
  gstPercentage: number;
  registrationFee: number;
  depositFee: number;
  staffEmail: string;
  staffPassword: string;
  enableGST: boolean;
}>;

type MasterFranchiseeGeneralFieldArgs = Nullish<{
  isMasterFranchiseeGeneralGSTPercentageNeed: boolean;
  isMasterFranchiseeGeneralRegistrationFeeNeed: boolean;
  isMasterFranchiseeGeneralDepositFeeNeed: boolean;
  isMasterFranchiseeGeneralStaffEmailNeed: boolean;
  isMasterFranchiseeGeneralStaffPasswordNeed: boolean;
  isMasterFranchiseeGeneralEnableGSTNeed: boolean;
}>;

type MasterFranchiseeGeneralFilterInput = Nullish<{
  id: FilterInteger;
  depositFee: FilterFloat;
  registrationFee: FilterFloat;
  gstPercentage: FilterFloat;
  masterFranchiseeId: FilterInteger;
  masterFranchiseeOwnerName: FilterString;
}>;

type FilterMasterFranchiseeGeneralsResponse = Nullish<{
  filterMasterFranchiseeGenerals: CursorPaginationReturnType<MasterFranchiseeGeneral>;
}>;

type FilterMasterFranchiseeGeneralsArgs =
  CursorPaginationArgs<MasterFranchiseeGeneralFilterInput> &
    MasterFranchiseeGeneralFieldArgs;

export type {
  MasterFranchiseeGeneral,
  MasterFranchiseeGeneralFieldArgs,
  MasterFranchiseeGeneralFilterInput,
  FilterMasterFranchiseeGeneralsResponse,
  FilterMasterFranchiseeGeneralsArgs,
};
