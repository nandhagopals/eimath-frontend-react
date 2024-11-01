import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

import { EducationalTerm } from "modules/EducationMaterials/Terms";
import { Country } from "modules/Settings/Country";

type EducationalLevel = Nullish<{
  id: number;
  name: string;
  country: Country;
  status: string;
  remarks: string;
  educationalLevelTerms: Nullish<{
    id: number;
    educationalTerm: EducationalTerm;
    position: number;
  }>[];
}>;

type EducationalLevelsFieldArgs = Nullish<{
  isCountryDetailsNeed: boolean;
  isStatusNeed: boolean;
  isRemarksNeed: boolean;
  isEducationalTermsNeed: boolean;
}>;

type EducationalLevelsFilterInput = Nullish<{
  id: FilterInteger;
  status: FilterString;
  countryId: FilterInteger;
  countryName: FilterString;
}>;

type FilterEducationalLevelsResponse = Nullish<{
  filterEducationalLevels: CursorPaginationReturnType<EducationalLevel>;
}>;

type FilterEducationalLevelsArgs = CursorPaginationArgs<
  EducationalLevelsFilterInput,
  "id" | "name" | "country"
> &
  EducationalLevelsFieldArgs;

type DeleteEducationalLevelResponse = Nullish<{
  deleteEducationalLevel: string;
}>;

interface DeleteEducationalLevelArgs {
  id: number;
}

export type {
  EducationalLevel,
  EducationalLevelsFieldArgs,
  EducationalLevelsFilterInput,
  FilterEducationalLevelsResponse,
  FilterEducationalLevelsArgs,
  DeleteEducationalLevelResponse,
  DeleteEducationalLevelArgs,
};
