import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

import { WorkbookInformation } from "modules/EducationMaterials/WorkbookManagement";
import { Country } from "modules/Settings/Country";

type EducationalTerm = Nullish<{
  id: number;
  name: string;
  price: number;
  country: Country;
  status: string;
  remarks: string;
  workbookInformation: WorkbookInformation[];
}>;

type EducationalTermsFieldArgs = Nullish<{
  isPriceNeed: boolean;
  isCountryDetailsNeed: boolean;
  isStatusNeed: boolean;
  isRemarksNeed: boolean;
  isWorkBookInformationNeed: boolean;
}>;

type EducationalTermsFilterInput = Nullish<{
  id: FilterInteger;
  status: FilterString;
  countryId: FilterInteger;
  countryName: FilterString;
}>;

type FilterEducationalTermsResponse = Nullish<{
  filterEducationalTerms: CursorPaginationReturnType<EducationalTerm>;
}>;

type FilterEducationalTermsArgs = CursorPaginationArgs<
  EducationalTermsFilterInput,
  "id" | "name" | "country" | "price"
> &
  EducationalTermsFieldArgs;

type DeleteEducationalTermResponse = Nullish<{
  deleteEducationalLevel: string;
}>;

interface DeleteEducationalTermArgs {
  id: number;
}

export type {
  EducationalTerm,
  EducationalTermsFieldArgs,
  EducationalTermsFilterInput,
  FilterEducationalTermsResponse,
  FilterEducationalTermsArgs,
  DeleteEducationalTermResponse,
  DeleteEducationalTermArgs,
};
