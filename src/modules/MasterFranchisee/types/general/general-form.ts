import { z } from "zod";

import { Nullish } from "global/types";

import {
  MasterFranchiseeGeneral,
  MasterFranchiseeGeneralFieldArgs,
  masterFranchiseeGeneralFormSchema,
} from "modules/MasterFranchisee";

type UpdateMasterFranchiseeGeneralResponse = Nullish<{
  updateMasterFranchiseeGeneral: MasterFranchiseeGeneral;
}>;

interface UpdateMasterFranchiseeGeneralArgs
  extends MasterFranchiseeGeneralFieldArgs {
  id: number;
  enableGST: boolean | null;
  gstPercentage: number | null;
  registrationFee: number | null;
  depositFee: number | null;
  staffEmail: string | null;
  staffPassword: string | null | undefined;
}

type MasterFranchiseeGeneralForm = z.infer<
  typeof masterFranchiseeGeneralFormSchema
>;

export type {
  UpdateMasterFranchiseeGeneralResponse,
  UpdateMasterFranchiseeGeneralArgs,
  MasterFranchiseeGeneralForm,
};
