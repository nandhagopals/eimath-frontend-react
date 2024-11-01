import { Nullish } from "global/types";

import { MasterFranchiseeTermFee } from "modules/MasterFranchisee";

type UpdateMasterFranchiseeTermFeeResponse = Nullish<{
  updateMasterFranchiseeTermFee: MasterFranchiseeTermFee;
}>;

interface UpdateMasterFranchiseeTermFeeArgs {
  id: number;
  price: number | null;
}

type GenerateMasterFranchiseeTermsCSVResponse = Nullish<{
  generateMFEducationalTermCSV: string;
}>;

interface GenerateMasterFranchiseeTermsCSVArgs {
  masterFranchiseeId: number;
}

export type {
  UpdateMasterFranchiseeTermFeeResponse,
  UpdateMasterFranchiseeTermFeeArgs,
  GenerateMasterFranchiseeTermsCSVResponse,
  GenerateMasterFranchiseeTermsCSVArgs,
};
