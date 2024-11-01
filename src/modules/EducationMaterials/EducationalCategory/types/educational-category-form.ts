import { z } from "zod";

import { CommonStatus, Nullish } from "global/types";

import {
  EducationalCategory,
  educationalCategoryFormSchema,
} from "modules/EducationMaterials/EducationalCategory";

type CreateEducationalCategoryResponse = Nullish<{
  createEducationalCategory: EducationalCategory;
}>;

interface CreateEducationalCategoryArgs {
  name: string;
  countryId: number;
  educationalLevels: {
    levelId: number;
    position: number;
    isFinalTerm: boolean;
  }[];
  remarks?: string | null;
}

type UpdateEducationalCategoryResponse = {
  updateEducationalCategory: EducationalCategory;
};

interface UpdateEducationalCategoryArgs
  extends Partial<CreateEducationalCategoryArgs> {
  id: number;
  status?: CommonStatus;
  isEducationalCategoryStatusNeed: boolean;
}

type DeleteEducationalCategoryResponse = Nullish<{
  deleteEducationalCategory: string;
}>;

interface DeleteEducationalCategoryArgs {
  id: number;
}

type EducationalCategoryForm = z.infer<typeof educationalCategoryFormSchema>;

type GenerateEducationalCategoryCSVResponse = Nullish<{
  generateEducationalCategoryCSV: string;
}>;

interface GenerateEducationalCategoryCSVArgs {
  status?: CommonStatus;
}

export type {
  CreateEducationalCategoryResponse,
  CreateEducationalCategoryArgs,
  UpdateEducationalCategoryResponse,
  UpdateEducationalCategoryArgs,
  DeleteEducationalCategoryResponse,
  DeleteEducationalCategoryArgs,
  EducationalCategoryForm,
  GenerateEducationalCategoryCSVResponse,
  GenerateEducationalCategoryCSVArgs,
};
