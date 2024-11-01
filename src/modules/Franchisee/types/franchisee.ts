import { z } from "zod";

import {
  CommonStatus,
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

import { Country } from "modules/Settings/Country";
import { franchiseesSortBySchema } from "modules/Franchisee";
import { EducationalCategory } from "modules/EducationMaterials/EducationalCategory";
import { MasterFranchiseeInformation } from "modules/MasterFranchisee";

type Franchisee = Nullish<{
  id: number;
  ownerName: string;
  ownerEmail: string;
  ownerIsdCode: string;
  ownerMobileNumber: string;
  ownerHomeAddress: string;
  status: CommonStatus;
  prefix: string;
  companyName: string;
  companyUEN: string;
  bankAccountNumber: string;
  country: Country;
  password: string;
  address: string;
  postalCode: string;
  postalCountry: Country;
  educationalCategories: EducationalCategory[];
  franchiseeName: string;
  masterFranchiseeInformation: MasterFranchiseeInformation;
}>;

type FranchiseeFieldArgs = Nullish<{
  isFranchiseeOwnerNameNeed: boolean;
  isFranchiseeOwnerEmailNeed: boolean;
  isFranchiseeOwnerIsdCodeNeed: boolean;
  isFranchiseeOwnerMobileNumberNeed: boolean;
  isFranchiseeOwnerHomeAddressNeed: boolean;
  isFranchiseeStatusNeed: boolean;
  isFranchiseePrefixNeed: boolean;
  isFranchiseeCompanyUENNeed: boolean;
  isFranchiseeBankAccountNumberNeed: boolean;
  isFranchiseeCountryNeed: boolean;
  isFranchiseePasswordNeed: boolean;
  isFranchiseeAddressNeed: boolean;
  isFranchiseePostalCodeNeed: boolean;
  isFranchiseePostalCountryNeed: boolean;
  isFranchiseeEducationalCategoriesNeed: boolean;
  isFranchiseeFranchiseeCompanyNameNeed: boolean;
  isFranchiseeMasterFranchiseeInformationNeed: boolean;
  isFranchiseeEducationalCategoryEducationalLevelNeed: boolean;
  isFranchiseeEducationalCategoryEducationalLevelEducationalTermNeed: boolean;
}>;

type FranchiseeFilterInput = Nullish<{
  id: FilterInteger;
  ownerName: FilterString;
  ownerEmail: FilterString;
  ownerIsdCode: FilterString;
  ownerMobileNumber: FilterString;
  prefix: FilterString;
  companyName: FilterString;
  companyUEN: FilterString;
  backAccountNumber: FilterString;
  status: FilterString;
  centerAddress: FilterString;
  ownerHomeAddress: FilterString;
  masterFranchiseeId: FilterInteger;
  masterFranchiseeOwnerName: FilterString;
  countryId: FilterInteger;
  countryName: FilterString;
}>;

type FilterFranchiseesResponse = Nullish<{
  filterFranchisees: CursorPaginationReturnType<Franchisee>;
}>;

type FranchiseesSortBy = NonNullable<
  z.infer<typeof franchiseesSortBySchema>
>["column"];

type FilterFranchiseesArgs = CursorPaginationArgs<
  FranchiseeFilterInput,
  FranchiseesSortBy
> &
  Nullish<{
    franchiseeEducationalCategoryId: FilterInteger;
    franchiseeEducationalCategoryStatus: FilterString;
    franchiseeEducationalCategoryEducationalLevelId: FilterInteger;
    franchiseeEducationalCategoryEducationalLevelStatus: FilterString;
    franchiseeEducationalCategoryEducationalLevelEducationalTermId: FilterInteger;
    franchiseeEducationalCategoryEducationalLevelEducationalTermStatus: FilterString;
  }> &
  FranchiseeFieldArgs;

type DeleteFranchiseeResponse = Nullish<{
  deleteFranchisee: string;
}>;

interface DeleteFranchiseeArgs {
  id: number;
}

type GenerateFranchiseeCSVResponse = Nullish<{
  generateFranchiseeCSV: string;
}>;

interface GenerateFranchiseeCSVArgs {
  status?: CommonStatus;
}

export type {
  Franchisee,
  FranchiseeFieldArgs,
  FranchiseeFilterInput,
  FilterFranchiseesResponse,
  FilterFranchiseesArgs,
  DeleteFranchiseeResponse,
  DeleteFranchiseeArgs,
  GenerateFranchiseeCSVResponse,
  GenerateFranchiseeCSVArgs,
};
