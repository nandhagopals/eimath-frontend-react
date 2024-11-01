import { z } from "zod";

import { Nullish } from "global/types";

import {
  Student,
  StudentFieldArgs,
  StudentStatus,
  studentFormSchema,
  studentKinRelationshipSchema,
} from "modules/Students";

type CreateStudentResponse = Nullish<{
  createStudent: Student;
}>;

interface CreateStudentArgs extends StudentFieldArgs {
  name: string;
  masterFranchiseeInformationId: number;
  educationalLevelId: number;
  franchiseeId: number;
  educationalTermId: number;
  studentKins: {
    name: string;
    relationship: string;
    isPrimary: boolean;
    isdCountryId: number;
    mobileNumber: string;
    email: string;
    address: string;
    postalCountryId: number;
    postalCode: string;
  }[];
  hasDiscount?: boolean;
  studentDiscounts?: { discountAmount: number; description: string }[] | null;
  educationalCategoryId: number;
}

type UpdateStudentResponse = Nullish<{
  updateStudent: Student;
}>;

interface UpdateStudentArgs extends Partial<CreateStudentArgs> {
  id: number;
  status?: StudentStatus;
}

type StudentForm = z.infer<typeof studentFormSchema>;

type StudentKinRelationship = z.infer<typeof studentKinRelationshipSchema>;

type GetStudentKinRelationshipResponse = {
  getStudentKinRelationship?: StudentKinRelationship[] | null;
};

export type {
  CreateStudentResponse,
  CreateStudentArgs,
  UpdateStudentResponse,
  UpdateStudentArgs,
  StudentForm,
  GetStudentKinRelationshipResponse,
  StudentKinRelationship,
};
