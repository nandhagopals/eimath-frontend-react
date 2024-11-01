import { z } from "zod";

import { CommonStatus, Nullish } from "global/types";

import {
  MasterFranchiseeInformation,
  MasterFranchiseeInformationFieldArgs,
  masterFranchiseeInformationFormSchema,
} from "modules/MasterFranchisee";

type CreateMasterFranchiseeInformationResponse = Nullish<{
  createMasterFranchiseeInformation: MasterFranchiseeInformation;
}>;

interface CreateMasterFranchiseeInformationArgs
  extends MasterFranchiseeInformationFieldArgs {
  ownerName: string;
  ownerEmail: string;
  isdCountryId: number;
  ownerMobileNumber: string;
  currencyCountryId: number;
  masterFranchiseeName: string;
  prefix: string;
  companyName: string;
  companyUEN: string;
  revenueRoyalties: number;
  royaltiesFromFranchisee: number;
  inSingapore: boolean;
  educationalCategoryIds: number[];
  address: string;
  postalCode: string;
  postalCountryId: number;
  pricePerSGD?: number | null;
}

type UpdateMasterFranchiseeInformationResponse = Nullish<{
  updateMasterFranchiseeInformation: MasterFranchiseeInformation;
}>;

interface UpdateMasterFranchiseeInformationArgs
  extends Partial<CreateMasterFranchiseeInformationArgs> {
  id: number;
  status?: CommonStatus;
  bankAccountNumber?: string;
  ownerPassword?: string;
}

type MasterFranchiseeInformationForm = z.infer<
  typeof masterFranchiseeInformationFormSchema
>;

export type {
  CreateMasterFranchiseeInformationResponse,
  CreateMasterFranchiseeInformationArgs,
  UpdateMasterFranchiseeInformationResponse,
  UpdateMasterFranchiseeInformationArgs,
  MasterFranchiseeInformationForm,
};
