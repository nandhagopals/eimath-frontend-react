import { z } from "zod";

import { CommonStatus, Nullish } from "global/types";

import {
  EducationalLevel,
  EducationalLevelsFieldArgs,
  educationalLevelFormSchema,
} from "modules/EducationMaterials/Levels";

type CreateEducationalLevelResponse = Nullish<{
  createEducationalLevel: EducationalLevel;
}>;

interface CreateEducationalLevelArgs extends EducationalLevelsFieldArgs {
  name: string;
  countryId: number;
  remarks?: string | null;
  educationalTerms: { position: number; termId: number }[];
}

type UpdateEducationalLevelResponse = Nullish<{
  updateEducationalLevel: EducationalLevel;
}>;

interface UpdateEducationalLevelArgs
  extends Partial<CreateEducationalLevelArgs> {
  id: number;
  status?: CommonStatus | null;
}

type EducationalLevelForm = z.infer<typeof educationalLevelFormSchema>;

type GenerateLevelsCSVResponse = Nullish<{
  generateLevelsCSV: string;
}>;

interface GenerateLevelsCSVArgs {
  status?: CommonStatus;
}

export type {
  CreateEducationalLevelResponse,
  CreateEducationalLevelArgs,
  UpdateEducationalLevelResponse,
  UpdateEducationalLevelArgs,
  EducationalLevelForm,
  GenerateLevelsCSVResponse,
  GenerateLevelsCSVArgs,
};
