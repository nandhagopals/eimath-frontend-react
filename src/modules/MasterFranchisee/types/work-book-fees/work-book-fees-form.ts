import { Nullish } from "global/types";

import { MasterFranchiseeWorkBookFee } from "modules/MasterFranchisee";

type UpdateMasterFranchiseeWorkBookFeeResponse = Nullish<{
  updateMasterFranchiseeWorkBookFee: MasterFranchiseeWorkBookFee;
}>;

interface UpdateMasterFranchiseeWorkBookFeeArgs {
  id: number;
  price: number | null;
}

type GenerateMasterFranchiseeWorkbookCSVResponse = Nullish<{
  generateMFWorkbookCSV: string;
}>;

interface GenerateMasterFranchiseeWorkbookCSVArgs {
  masterFranchiseeId: number;
}

export type {
  UpdateMasterFranchiseeWorkBookFeeResponse,
  UpdateMasterFranchiseeWorkBookFeeArgs,
  GenerateMasterFranchiseeWorkbookCSVResponse,
  GenerateMasterFranchiseeWorkbookCSVArgs,
};
