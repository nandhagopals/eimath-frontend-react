import { z } from "zod";

import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterFloat,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

import { EducationalTerm } from "modules/EducationMaterials/Terms";
import { masterFranchiseeTermFeesSortBySchema } from "modules/MasterFranchisee";

type MasterFranchiseeTermFee = Nullish<{
  id: number;
  price: number;
  educationalTerm: EducationalTerm;
}>;

type MasterFranchiseeTermFeeFieldArgs = Nullish<{
  isMasterFranchiseeTermFeePriceNeed: boolean;
  isMasterFranchiseeTermFeeEducationalTermNeed: boolean;
  isMasterFranchiseeTermFeeEducationalTermWorkbookNeed: boolean;
}>;

type MasterFranchiseeTermFeeFilterInput = Nullish<{
  id: FilterInteger;
  price: FilterFloat;
  masterFranchiseeId: FilterInteger;
  educationalTermId: FilterInteger;
  educationalTermName: FilterString;
  countryId: FilterInteger;
  educationalTermStatus: FilterString;
}>;

type FilterMasterFranchiseeTermFeesResponse = Nullish<{
  filterMasterFranchiseeTermFees: CursorPaginationReturnType<MasterFranchiseeTermFee>;
}>;

type MasterFranchiseeTermFeesSortBy = NonNullable<
  z.infer<typeof masterFranchiseeTermFeesSortBySchema>
>["column"];

type FilterMasterFranchiseeTermFeesArgs = CursorPaginationArgs<
  MasterFranchiseeTermFeeFilterInput,
  MasterFranchiseeTermFeesSortBy
> &
  MasterFranchiseeTermFeeFieldArgs;

export type {
  MasterFranchiseeTermFee,
  MasterFranchiseeTermFeeFieldArgs,
  MasterFranchiseeTermFeeFilterInput,
  FilterMasterFranchiseeTermFeesResponse,
  FilterMasterFranchiseeTermFeesArgs,
};
