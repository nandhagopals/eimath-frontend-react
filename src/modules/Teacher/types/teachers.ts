import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  DateTime,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

import { Franchisee } from "modules/Franchisee";
import { MasterFranchiseeInformation } from "modules/MasterFranchisee";
import { Country } from "modules/Settings/Country";

type Teacher = Nullish<{
  id: number;
  name: string;
  email: string;
  isdCode: string;
  mobileNumber: string;
  masterFranchiseeInformation: MasterFranchiseeInformation;
  franchiseeInformation: Franchisee;
  country: Country;
  joinDate: DateTime;
}>;

type TeacherFieldArgs = Nullish<{
  isEmailNeed: boolean;
  isISDCodeNeed: boolean;
  isMobileNumberNeed: boolean;
  isFranchiseInformationNeed: boolean;
  isStatusNeed: boolean;
  isMasterFranchiseeInformationNeed: boolean;
  isCountryNeed: boolean;
  isJoinDateNeed: boolean;
}>;

type TeacherFilterInput = Nullish<{
  id: FilterInteger;
  name: FilterString;
  email: FilterString;
  isdCode: FilterString;
  mobileNumber: FilterString;
  masterFranchiseeOwnerName: FilterString;
  franchiseeOwnerName: FilterString;
  status: FilterString;
}>;

type FilterTeachersResponse = Nullish<{
  filterTeachers: CursorPaginationReturnType<Teacher>;
}>;

type FilterTeacherArgs = CursorPaginationArgs<
  TeacherFilterInput,
  "id" | "name" | "masterFranchiseeInformation" | "franchiseeInformation"
> &
  TeacherFieldArgs;

type DeleteTeacherResponse = Nullish<{
  deleteTeacher: string;
}>;

interface DeleteTeacherArgs {
  id: number;
}

export type {
  Teacher,
  TeacherFieldArgs,
  TeacherFilterInput,
  FilterTeachersResponse,
  FilterTeacherArgs,
  DeleteTeacherResponse,
  DeleteTeacherArgs,
};
