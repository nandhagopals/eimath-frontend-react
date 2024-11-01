import { z } from "zod";

import { Nullish } from "global/types";

import { MasterGeneralSetting } from "modules/Settings/GeneralSetting";

type CreateMasterGeneralSettingResponse = Nullish<{
  createMasterGeneralSetting: MasterGeneralSetting;
}>;

interface CreateMasterGeneralSettingArgs {
  enableGst: boolean;
  gstPercentage: number;
  pricePerPoint: number;
}

type UpdateMasterGeneralSettingResponse = Nullish<{
  updateMasterGeneralSetting: MasterGeneralSetting;
}>;

interface UpdateMasterGeneralSettingArgs
  extends Partial<CreateMasterGeneralSettingArgs> {
  id: number;
}

const masterGeneralSettingFormSchema = z.object({
  enableGst: z.boolean(),
  gstPercentage: z.number(),
  pricePerPoint: z.number(),
});

type MasterGeneralSettingForm = z.infer<typeof masterGeneralSettingFormSchema>;

export { masterGeneralSettingFormSchema };
export type {
  MasterGeneralSettingForm,
  CreateMasterGeneralSettingResponse,
  CreateMasterGeneralSettingArgs,
  UpdateMasterGeneralSettingResponse,
  UpdateMasterGeneralSettingArgs,
};
