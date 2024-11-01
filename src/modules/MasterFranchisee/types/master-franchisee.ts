import { z } from "zod";

import {
  masterFranchiseePriceOrPointFormSchema,
  tabs,
} from "modules/MasterFranchisee";
import { CommonStatus, Nullish } from "global/types";

type Page = (typeof tabs)[number]["name"];

type MasterFranchiseeEditPriceOrPointForm = z.infer<
  typeof masterFranchiseePriceOrPointFormSchema
>;

type GenerateMasterFranchiseeCSVResponse = Nullish<{
  generateMasterFranchiseeCSV: string;
}>;

interface GenerateMasterFranchiseeCSVArgs {
  status?: CommonStatus;
}

export type {
  Page,
  MasterFranchiseeEditPriceOrPointForm,
  GenerateMasterFranchiseeCSVResponse,
  GenerateMasterFranchiseeCSVArgs,
};
