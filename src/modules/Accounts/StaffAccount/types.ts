import { z } from "zod";

import { mobileInputSchema } from "components/Form";

import {
  defaultZodErrorMessage,
  emailZodSchema,
  nameZodSchema,
  passwordZodSchema,
  dateFieldSchema,
  idAndNameSchema,
} from "global/helpers";
import {
  CommonStatus,
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

import { Country } from "modules/Settings/Country";
import { Role } from "modules/Accounts/RoleAccess";

const genderSchema = z.union(
  [z.literal("Male"), z.literal("Female"), z.literal("Others")],
  defaultZodErrorMessage
);

type Gender = z.infer<typeof genderSchema>;

type Staff = Nullish<{
  id: number;
  name: string;
  isdCode: string;
  mobileNumber: string;
  email: string;
  dob: string;
  status: CommonStatus;
  gender: Gender;
  country: Country;
  password: string;
  roles: Role[];
}>;

type StaffFieldArgs = Partial<{
  isStaffIsdCodeNeed: boolean;
  isStaffMobileNumberNeed: boolean;
  isStaffEmailNeed: boolean;
  isStaffDobNeed: boolean;
  isStaffStatusNeed: boolean;
  isStaffGenderNeed: boolean;
  isStaffCountryNeed: boolean;
  isStaffPasswordNeed: boolean;
  isStaffRoleNeed: boolean;
}>;

type StaffFilterInput = Nullish<{
  id: FilterInteger;
  name: FilterString;
  status: FilterString;
  roleId: FilterInteger;
}>;

type FilterStaffsResponse = Nullish<{
  filterStaffs: CursorPaginationReturnType<Staff>;
}>;

type FilterStaffArgs = StaffFieldArgs &
  CursorPaginationArgs<StaffFilterInput, "id" | "name" | "status" | "roles">;

type CreateStaffResponse = Nullish<{
  createStaff: Staff;
}>;

interface CreateStaffArgs extends StaffFieldArgs {
  name: string;
  gender: Gender;
  email: string;
  password: string;
  countryId: number;
  mobileNumber: string;
  roleId: number;
}

type UpdateStaffResponse = Nullish<{
  updateStaff: Staff;
}>;

interface UpdateStaffArgs extends Partial<CreateStaffArgs> {
  id: number;
  dob?: string | null;
  status?: CommonStatus;
}

const staffFormSchema = z.object({
  name: nameZodSchema(true),
  gender: z.set(genderSchema),
  email: emailZodSchema(true),
  mobile: mobileInputSchema,
  password: passwordZodSchema(),
  role: idAndNameSchema(z.number()),
  dateOfBirth: dateFieldSchema.nullish(),
});

type StaffForm = z.infer<typeof staffFormSchema>;

export { staffFormSchema };

export type {
  Staff,
  StaffFieldArgs,
  FilterStaffsResponse,
  FilterStaffArgs,
  CreateStaffResponse,
  CreateStaffArgs,
  UpdateStaffResponse,
  UpdateStaffArgs,
  StaffFilterInput,
  StaffForm,
};
