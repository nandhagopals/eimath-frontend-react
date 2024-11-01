import { z } from "zod";

import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterFloat,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

import { Product } from "modules/Products";
import { masterFranchiseeProductFeesSortBySchema } from "modules/MasterFranchisee/schema";

type MasterFranchiseeProductFee = Nullish<{
  id: number;
  price: number;
  product: Product;
}>;

type MasterFranchiseeProductFeeFieldArgs = Nullish<{
  isMasterFranchiseeProductFeePriceNeed: boolean;
  isMasterFranchiseeProductFeeProductNeed: boolean;
}>;

type MasterFranchiseeProductFeeFilterInput = Nullish<{
  id: FilterInteger;
  points: FilterFloat;
  masterFranchiseeId: FilterInteger;
  name: FilterString;
  categoryName: FilterString;
  categoryId: FilterInteger;
  masterFranchiseeOwnerName: FilterString;
  description: FilterString;
  variance: FilterString;
  isVariance: boolean;
  status: FilterString;
}>;

type FilterMasterFranchiseeProductFeesResponse = Nullish<{
  filterMasterFranchiseeProductFees: CursorPaginationReturnType<MasterFranchiseeProductFee>;
}>;

type MasterFranchiseeProductFeesSortBy = NonNullable<
  z.infer<typeof masterFranchiseeProductFeesSortBySchema>
>["column"];

type FilterMasterFranchiseeProductFeesArgs = CursorPaginationArgs<
  MasterFranchiseeProductFeeFilterInput,
  MasterFranchiseeProductFeesSortBy
> &
  MasterFranchiseeProductFeeFieldArgs;

export type {
  MasterFranchiseeProductFee,
  MasterFranchiseeProductFeeFieldArgs,
  MasterFranchiseeProductFeeFilterInput,
  FilterMasterFranchiseeProductFeesResponse,
  FilterMasterFranchiseeProductFeesArgs,
};
