import { z } from "zod";

import { CommonStatus, Nullish } from "global/types";

import { Teacher, TeacherFieldArgs, teacherFormSchema } from "modules/Teacher";

type CreateTeacherResponse = Nullish<{
  createTeacher: Teacher;
}>;

interface CreateTeacherArgs extends TeacherFieldArgs {
  name: string;
  email: string;
  countryId: number;
  mobileNumber: string;
  masterFranchiseeInformationId: number;
  franchiseeInformationId: number;
  joinDate: string;
}

type UpdateTeacherResponse = Nullish<{
  updateTeacher: Teacher;
}>;

interface UpdateTeacherArgs extends Partial<CreateTeacherArgs> {
  id: number;
  status?: CommonStatus;
}

type TeacherFormDetails = z.infer<typeof teacherFormSchema>;

type GenerateTeacherCSVResponse = Nullish<{
  generateTeacherCSV: string;
}>;

interface GenerateTeacherCSVArgs {
  status?: CommonStatus;
}

export type {
  CreateTeacherResponse,
  CreateTeacherArgs,
  UpdateTeacherResponse,
  UpdateTeacherArgs,
  TeacherFormDetails,
  GenerateTeacherCSVResponse,
  GenerateTeacherCSVArgs,
};
