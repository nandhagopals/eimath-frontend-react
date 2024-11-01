import {
  CommonStatus,
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterFloat,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

import { EducationalCategory } from "modules/EducationMaterials/EducationalCategory";
import { EducationalTerm } from "modules/EducationMaterials/Terms";
import { WorkbookInformation } from "modules/EducationMaterials/WorkbookManagement";
import { Product } from "modules/Products";
import { Country } from "modules/Settings/Country";

type MasterFranchiseeInformation = Nullish<{
  id: number;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerIsdCode: string;
  ownerMobileNumber: string;
  currency: string;
  status: CommonStatus;
  masterFranchiseeName: string;
  prefix: string;
  companyName: string;
  companyUEN: string;
  revenueRoyalties: number;
  royaltiesFromFranchisee: number;
  inSingapore: boolean;
  bankAccountNumber: string;
  currencyCountry: Country;
  isdCountry: Country;
  educationalCategories: EducationalCategory[];
  address: string;
  postalCode: string;
  postalCountry: Country;
  masterFranchiseeProduct: Nullish<{
    id: number;
    price: number;
    product: Product;
  }>[];
  masterFranchiseeWorkBook: Nullish<{
    id: number;
    price: number;
    workbookInformation: WorkbookInformation;
  }>[];
  masterFranchiseeEducationalTerm: Nullish<{
    id: number;
    price: number;
    educationalTerm: EducationalTerm;
  }>[];
  pricePerSGD: number;
  pointsAvailable: number;
}>;

type MasterFranchiseeInformationFieldArgs = Nullish<{
  isMasterFranchiseeInformationOwnerNameNeed: boolean;
  isMasterFranchiseeInformationOwnerEmailNeed: boolean;
  isMasterFranchiseeInformationOwnerPasswordNeed: boolean;
  isMasterFranchiseeInformationIsdCountryNeed: boolean;
  isMasterFranchiseeInformationOwnerMobileNumberNeed: boolean;
  isMasterFranchiseeInformationCurrencyCountryNeed: boolean;
  isMasterFranchiseeInformationStatusNeed: boolean;
  isMasterFranchiseeInformationPrefixNeed: boolean;
  isMasterFranchiseeInformationCompanyNameNeed: boolean;
  isMasterFranchiseeInformationCompanyUENNeed: boolean;
  isMasterFranchiseeInformationRevenueRoyaltiesNeed: boolean;
  isMasterFranchiseeInformationRoyaltiesFromFranchiseNeed: boolean;
  isMasterFranchiseeInformationInSingaporeNeed: boolean;
  isMasterFranchiseeInformationBankAccountNumberNeed: boolean;
  isMasterFranchiseeInformationOwnerIsdCodeNeed: boolean;
  isMasterFranchiseeInformationCurrencyNeed: boolean;
  isMasterFranchiseeInformationEducationCategoryNeed: boolean;
  isMasterFranchiseeInformationAddressNeed: boolean;
  isMasterFranchiseeInformationPostalCodeNeed: boolean;
  isMasterFranchiseeInformationPostalCountryNeed: boolean;
  isMasterFranchiseeMasterFranchiseeProductNeed: boolean;
  isMasterFranchiseeMasterFranchiseeWorkBookNeed: boolean;
  isMasterFranchiseeMasterFranchiseeEducationalTermNeed: boolean;
  isMasterFranchiseePricePerSGDNeed: boolean;
}>;

type MasterFranchiseeInformationFilterInput = Nullish<{
  id: FilterInteger;
  ownerName: FilterString;
  ownerEmail: FilterString;
  ownerISDCode: FilterString;
  ownerMobileNumber: FilterString;
  currency: FilterString;
  status: FilterString;
  staffEmail: FilterString;
  masterFranchiseName: FilterString;
  prefix: FilterString;
  companyName: FilterString;
  companyUEN: FilterString;
  revenueRoyalties: FilterFloat;
  royaltiesFromFranchise: FilterFloat;
  inSingapore: boolean;
  isOwnFranchise: boolean;
  bankAccountNumber: FilterString;
}>;

type FilterMasterFranchiseeInformationResponse = Nullish<{
  filterMasterFranchiseeInformation: CursorPaginationReturnType<MasterFranchiseeInformation>;
}>;

type FilterMasterFranchiseeInformationArgs = CursorPaginationArgs<
  MasterFranchiseeInformationFilterInput,
  "id" | "ownerName" | "prefix" | "status"
> &
  MasterFranchiseeInformationFieldArgs;

type DeleteMasterFranchiseeInformationResponse = Nullish<{
  deleteMasterFranchiseeInformation: string;
}>;

interface DeleteMasterFranchiseeInformationArgs {
  id: number;
}

export type {
  MasterFranchiseeInformation,
  MasterFranchiseeInformationFieldArgs,
  MasterFranchiseeInformationFilterInput,
  FilterMasterFranchiseeInformationResponse,
  FilterMasterFranchiseeInformationArgs,
  DeleteMasterFranchiseeInformationResponse,
  DeleteMasterFranchiseeInformationArgs,
};
