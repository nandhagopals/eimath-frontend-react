import { z } from "zod";

import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterFloat,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

import { WorkbookInformation } from "modules/EducationMaterials/WorkbookManagement";
import { masterFranchiseeWorkBookFeesSortBySchema } from "modules/MasterFranchisee";
import { EducationalTerm } from "modules/EducationMaterials/Terms";

type MasterFranchiseeWorkBookFee = Nullish<{
  id: number;
  price: number;
  workBookInformation: WorkbookInformation;
  termInformation: EducationalTerm;
}>;

type MasterFranchiseeWorkBookFeeFieldArgs = Nullish<{
  isMasterFranchiseeWorkBookFeePriceNeed: boolean;
  isMasterFranchiseeWorkBookFeeWorkBookInformationNeed: boolean;
}>;

type MasterFranchiseeWorkBookFeeFilterInput = Nullish<{
  id: FilterInteger;
  price: FilterFloat;
  masterFranchiseeId: FilterInteger;
  workBookInformationId: FilterInteger;
  workBookInformationName: FilterString;
  countryId: FilterInteger;
  workbookInformationStatus: FilterString;
}>;

type FilterMasterFranchiseeWorkBookFeesResponse = Nullish<{
  filterMasterFranchiseeWorkBookFees: CursorPaginationReturnType<MasterFranchiseeWorkBookFee>;
}>;

type MasterFranchiseeWorkBookFeesSortBy = NonNullable<
  z.infer<typeof masterFranchiseeWorkBookFeesSortBySchema>
>["column"];

type FilterMasterFranchiseeWorkBookFeesArgs = CursorPaginationArgs<
  MasterFranchiseeWorkBookFeeFilterInput,
  MasterFranchiseeWorkBookFeesSortBy
> &
  MasterFranchiseeWorkBookFeeFieldArgs;

export type {
  MasterFranchiseeWorkBookFee,
  MasterFranchiseeWorkBookFeeFieldArgs,
  MasterFranchiseeWorkBookFeeFilterInput,
  FilterMasterFranchiseeWorkBookFeesResponse,
  FilterMasterFranchiseeWorkBookFeesArgs,
};
