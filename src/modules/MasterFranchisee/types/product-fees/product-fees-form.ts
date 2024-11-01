import { Nullish } from "global/types";

import { MasterFranchiseeProductFee } from "modules/MasterFranchisee";

type UpdateMasterFranchiseeProductFeeResponse = Nullish<{
  updateMasterFranchiseeProductFee: MasterFranchiseeProductFee;
}>;

interface UpdateMasterFranchiseeProductFeeArgs {
  id: number;
  price: number | null;
}

type GenerateMasterFranchiseeProductCSVResponse = Nullish<{
  generateMFProductCSV: string;
}>;

interface GenerateMasterFranchiseeProductCSVArgs {
  masterFranchiseeId: number;
}

export type {
  UpdateMasterFranchiseeProductFeeResponse,
  UpdateMasterFranchiseeProductFeeArgs,
  GenerateMasterFranchiseeProductCSVResponse,
  GenerateMasterFranchiseeProductCSVArgs,
};
