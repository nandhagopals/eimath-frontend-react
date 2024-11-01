import { EducationalCategory } from "modules/EducationMaterials/EducationalCategory";
import { z } from "zod";

import {
  CommonStatus,
  CursorPaginationArgs,
  CursorPaginationReturnType,
  DateTime,
  FilterInteger,
  FilterString,
  Nullish,
  PDF,
  User,
} from "global/types";

import { EducationalLevel } from "modules/EducationMaterials/Levels";
import { Franchisee } from "modules/Franchisee";
import { EducationalTerm } from "modules/EducationMaterials/Terms";
import { MasterFranchiseeInformation } from "modules/MasterFranchisee";
import { Country } from "modules/Settings/Country";
import {
  StudentKinRelationship,
  remarksFilterAndFormSchema,
  withdrawRemarkFormSchema,
  Invoice,
  InvoiceFieldArgs,
} from "modules/Students";

type StudentStatus =
  | "Registered"
  | "Active"
  | "Past"
  | "Archived"
  | "Withdrawn"
  | "Graduated"
  | "Deleted"
  | "Inactive"
  | "InProgress"
  | "Pending";

type StudentKin = Nullish<{
  id: number;
  name: string;
  relationship: StudentKinRelationship;
  isPrimaryContact: boolean;
  isdCode: string;
  mobileNumber: string;
  email: string;
  address: string;
  postalCode: string;
  isdCountry: Country;
  postalCountry: Country;
}>;

type StudentRemark = Nullish<{
  id: number;
  remarks: string;
  updatedAt: string;
}>;

type StudentInvoiceDiscount = Nullish<{
  id: number;
  discountAmount: number;
  description: string;
}>;

type Student = Nullish<{
  id: number;
  name: string;
  status: StudentStatus;
  studentKins: StudentKin[];
  studentRemarks: StudentRemark[];
  educationalTerm: EducationalTerm;
  educationalLevel: EducationalLevel;
  masterFranchiseeInformation: MasterFranchiseeInformation;
  franchiseeInformation: Franchisee;
  createdByUser: User;
  createdByMF: MasterFranchiseeInformation;
  createdByFranchisee: Franchisee;
  graduatedAt: DateTime;
  studentDiscounts: StudentInvoiceDiscount[];
  primaryKin: StudentKin;
  hasDiscount: boolean;
  educationalCategory: EducationalCategory;
  studentId: string;
  nextEducationalLevel: EducationalLevel;
  nextEducationalTerm: EducationalTerm;
  withdrawRemarks: string;
  withdrawnAt: DateTime;
  joinedAt: DateTime;
}>;

type StudentKinFieldArgs = Nullish<{
  isStudentKinRelationshipNeed: boolean;
  isStudentKinIsPrimaryContactNeed: boolean;
  isStudentKinIsdCodeNeed: boolean;
  isStudentKinMobileNumberNeed: boolean;
  isStudentKinEmailNeed: boolean;
  isStudentKinAddressNeed: boolean;
  isStudentKinPostalCodeNeed: boolean;
  isStudentKinISDCountryNeed: boolean;
  isStudentKinPostalCountryNeed: boolean;
}>;

type StudentFieldArgs = Nullish<{
  isStudentStatusNeed: boolean;
  isStudentStudentKinsNeed: boolean;
  isStudentStudentRemarksNeed: boolean;
  isStudentEducationalTermNeed: boolean;
  isStudentEducationalLevelNeed: boolean;
  isStudentMasterFranchiseeInformationNeed: boolean;
  isStudentMasterFranchiseeInformationWorkbooksNeed: boolean;
  isStudentFranchiseeNeed: boolean;
  isStudentCreatedByUserNeed: boolean;
  isStudentCreatedByMFNeed: boolean;
  isStudentCreatedByFranchiseeNeed: boolean;
  isStudentGraduatedAtNeed: boolean;
  isStudentStudentDiscountsNeed: boolean;
  isStudentPrimaryKinNeed: boolean;
  isStudentHasDiscountNeed: boolean;
  isStudentEducationalCategoryNeed: boolean;
  isStudentNextEducationalLevelNeed: boolean;
  isStudentNextEducationalTermNeed: boolean;
  isStudentNextEducationalTermWorkbooksNeed: boolean;
  isStudentWithdrawRemarkNeed: boolean;
  isStudentWithdrawnAtNeed: boolean;
  isStudentJoinedAtNeed: boolean;
}> &
  StudentKinFieldArgs;

type StudentsFilterInput = Nullish<{
  id: FilterInteger;
  name: FilterString;
  educationalTermId: FilterInteger;
  educationalTermName: FilterString;
  educationalLevelId: FilterInteger;
  educationalLevelName: FilterString;
  workbookInformationId: FilterInteger;
  workbookInformationName: FilterString;
  franchiseeId: FilterInteger;
  masterFranchiseeId: FilterInteger;
  status: FilterString;
}>;

type FilterStudentsResponse = Nullish<{
  filterStudents: CursorPaginationReturnType<Student>;
}>;

type FilterStudentsArgs = CursorPaginationArgs<
  StudentsFilterInput,
  | "id"
  | "name"
  | "educationalLevel"
  | "franchiseeInformation"
  | "nextEducationalLevel"
> & {
  excludeInProgressStudentRenewal?: boolean;
} & StudentFieldArgs;

type StudentRemarksFilterInput = Nullish<{
  id: FilterInteger;
  studentId: FilterInteger;
}>;

type FilterStudentRemarksResponse = Nullish<{
  filterStudentRemarks: CursorPaginationReturnType<StudentRemark>;
}>;

type FilterStudentRemarksArgs = CursorPaginationArgs<StudentRemarksFilterInput>;

type UpdateStudentRemarkResponse = Nullish<{
  updateStudentRemark: StudentRemark;
}>;

interface UpdateStudentRemarkArgs {
  id: number;
  remarks?: string | null;
}

type CreateStudentRemarkResponse = Nullish<{
  createStudentRemark: StudentRemark;
}>;
type CreateStudentRemarkArgs = Nullish<{
  remarks: string;
  studentId: number;
}>;

type DeleteStudentRemarkResponse = Nullish<{
  deleteStudentRemark: string;
}>;

interface DeleteStudentRemarkArgs {
  id: number;
}

type RemarksFilterAndFormSchema = z.infer<typeof remarksFilterAndFormSchema>;

type GenerateStudentCSVResponse = Nullish<{
  generateStudentCSV: string;
}>;

interface GenerateStudentCSVArgs {
  status?: CommonStatus;
}

type RenewStudentsResponse = Nullish<{
  renewStudents?: {
    invoice: Invoice;
    invoiceFile: PDF;
  }[];
}>;

type RenewStudentFieldArgs = Nullish<{
  isRenewStudentInvoiceFileNeed: boolean;
}> &
  InvoiceFieldArgs;

interface RenewStudentsArgs extends RenewStudentFieldArgs {
  studentIds: number[];
}

type WithdrawStudentsResponse = Nullish<{
  withdrawStudents: string;
}>;

type WithdrawStudentArgs = {
  withdrawInfo: { studentId: number; withdrawRemarks?: string | null }[];
};

type WithdrawForm = z.infer<typeof withdrawRemarkFormSchema>;

type ConfirmStudentRenewalInvoicesResponse = Nullish<{
  confirmStudentRenewalInvoices: string;
}>;

interface ConfirmStudentRenewalInvoicesArgs {
  invoiceIds: number[];
}

export type {
  Student,
  StudentFieldArgs,
  StudentsFilterInput,
  FilterStudentsResponse,
  FilterStudentsArgs,
  StudentStatus,
  FilterStudentRemarksResponse,
  FilterStudentRemarksArgs,
  UpdateStudentRemarkResponse,
  UpdateStudentRemarkArgs,
  DeleteStudentRemarkResponse,
  DeleteStudentRemarkArgs,
  RemarksFilterAndFormSchema,
  StudentKin,
  StudentInvoiceDiscount,
  GenerateStudentCSVResponse,
  GenerateStudentCSVArgs,
  RenewStudentsResponse,
  RenewStudentsArgs,
  CreateStudentRemarkArgs,
  CreateStudentRemarkResponse,
  WithdrawStudentArgs,
  WithdrawStudentsResponse,
  WithdrawForm,
  ConfirmStudentRenewalInvoicesArgs,
  ConfirmStudentRenewalInvoicesResponse,
  RenewStudentFieldArgs,
};
