import { z } from "zod";

import { CommonStatus, Nullish } from "global/types";

import {
  EducationalTerm,
  EducationalTermsFieldArgs,
  educationTermFormSchema,
} from "modules/EducationMaterials/Terms";

type CreateEducationalTermResponse = Nullish<{
  createEducationalTerm: EducationalTerm;
}>;

interface CreateEducationalTermArgs extends EducationalTermsFieldArgs {
  name: string;
  price: number;
  countryId: number;
  remarks?: string | null;
  workbookInformationIds: number[];
}

type UpdateEducationalTermResponse = Nullish<{
  updateEducationalTerm: EducationalTerm;
}>;

interface UpdateEducationalTermArgs extends Partial<CreateEducationalTermArgs> {
  id: number;
  status?: CommonStatus;
}

type EducationalTermForm = z.infer<typeof educationTermFormSchema>;

type GenerateTermsCSVResponse = Nullish<{
  generateTermsCSV: string;
}>;

interface GenerateTermsCSVArgs {
  status?: CommonStatus;
}

export type {
  CreateEducationalTermResponse,
  CreateEducationalTermArgs,
  UpdateEducationalTermResponse,
  UpdateEducationalTermArgs,
  EducationalTermForm,
  GenerateTermsCSVResponse,
  GenerateTermsCSVArgs,
};
