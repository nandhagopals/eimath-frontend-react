import { z } from "zod";

import { CommonStatus, Nullish } from "global/types";

import {
  Franchisee,
  FranchiseeFieldArgs,
  franchiseeFormSchema,
} from "modules/Franchisee";

type CreateFranchiseeResponse = Nullish<{
  createFranchisee: Franchisee;
}>;

interface CreateFranchiseeArgs extends FranchiseeFieldArgs {
  masterFranchiseeInformationId: number;
  countryId: number;
  ownerName: string;
  ownerEmail: string;
  ownerMobileNumber: string;
  prefix: string;
  companyName: string;
  companyUEN: string;
  bankAccountNumber?: string | null;
  ownerHomeAddress: string;
  address: string;
  postalCode: string;
  postalCountryId: number;
  educationalCategoryIds: number[];
  franchiseeName: string;
}

type UpdateFranchiseeResponse = Nullish<{
  updateFranchisee: Franchisee;
}>;

interface UpdateFranchiseeArgs extends Partial<CreateFranchiseeArgs> {
  id: number;
  status?: CommonStatus;
  password?: string;
}

type FranchiseeForm = z.infer<typeof franchiseeFormSchema>;

export type {
  CreateFranchiseeResponse,
  CreateFranchiseeArgs,
  UpdateFranchiseeResponse,
  UpdateFranchiseeArgs,
  FranchiseeForm,
};
