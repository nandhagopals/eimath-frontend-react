import {
  CommonStatus,
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

import { Country } from "modules/Settings/Country";
import { EducationalLevel } from "modules/EducationMaterials/Levels";

type EducationalCategory = Nullish<{
  id: number;
  name: string;
  country: Country;
  educationalCategoryLevels: Nullish<{
    id: number;
    educationalLevel: EducationalLevel;
    position: number;
    isFinalTerm: boolean;
  }>[];
  status: CommonStatus;
  remarks: string;
}>;

type EducationalCategoryFieldArgs = Nullish<{
  isEducationalCategoryCountryNeed: boolean;
  isEducationalCategoryEducationalLevelsNeed: boolean;
  isEducationalCategoryStatusNeed: boolean;
  isEducationalCategoryRemarksNeed: boolean;
}>;

type EducationalCategoryFilterInput = Nullish<{
  id: FilterInteger;
  name: FilterString;
  status: FilterString;
  countryId: FilterInteger;
  countryName: FilterString;
  remarks: FilterString;
  educationLevelId: FilterInteger;
  educationLevelName: FilterString;
}>;

type FilterEducationalCategoriesResponse = Nullish<{
  filterEducationalCategories: CursorPaginationReturnType<EducationalCategory>;
}>;

type FilterEducationalCategoriesArgs = CursorPaginationArgs<
  EducationalCategoryFilterInput,
  "id" | "name"
> &
  EducationalCategoryFieldArgs;

export type {
  EducationalCategory,
  EducationalCategoryFieldArgs,
  EducationalCategoryFilterInput,
  FilterEducationalCategoriesResponse,
  FilterEducationalCategoriesArgs,
};
