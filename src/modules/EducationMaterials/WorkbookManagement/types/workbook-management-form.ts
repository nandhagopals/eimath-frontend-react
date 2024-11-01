import { z } from "zod";

import { CommonStatus, Nullish } from "global/types";

import {
  WorkbookInformation,
  WorkbookInformationFieldArgs,
  workbookInformationFormSchema,
} from "modules/EducationMaterials/WorkbookManagement";

type CreateWorkbookInformationResponse = Nullish<{
  createWorkbookInformation: WorkbookInformation;
}>;

interface CreateWorkbookInformationArgs extends WorkbookInformationFieldArgs {
  name: string;
  countryId: number;
  price: number;
  workbookFiles: File[] | null | undefined;
  workbookAnswerFiles: File[] | null | undefined;
  remarks?: string | null;
}

type UpdateWorkbookInformationResponse = Nullish<{
  updateWorkbookInformation: WorkbookInformation;
}>;

interface UpdateWorkbookInformationArgs
  extends Partial<CreateWorkbookInformationArgs> {
  id: number;
  status?: CommonStatus;
}

type WorkbookInformationForm = z.infer<typeof workbookInformationFormSchema>;

type GenerateWorkbookInformationCSVResponse = Nullish<{
  generateWorkbookInformationCSV: string;
}>;

interface GenerateWorkbookInformationCSVArgs {
  status?: CommonStatus;
}

export type {
  CreateWorkbookInformationResponse,
  CreateWorkbookInformationArgs,
  UpdateWorkbookInformationResponse,
  UpdateWorkbookInformationArgs,
  WorkbookInformationForm,
  GenerateWorkbookInformationCSVResponse,
  GenerateWorkbookInformationCSVArgs,
};
