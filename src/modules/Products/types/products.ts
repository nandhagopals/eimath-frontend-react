import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterFloat,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

import { ProductCategory } from "modules/Settings/ProductCategory";

type ProductImageFileDetails = Nullish<{
  id: number;
  originalFileName: string;
  fileURL: string;
  fileName: string;
  mimeType: string;
}>;

type Product = Nullish<{
  id: number;
  name: string;
  points: number;
  productCategory: ProductCategory[];
  productImages: ProductImageFileDetails[];
  productVariance: {
    id: number | null | undefined;
    name: string | null | undefined;
  }[];
  status: string;
  description: string;
  hasVariance: boolean;
  isComesUnderRoyalty: boolean;
}>;

type ProductsFieldArgs = Nullish<{
  isHasVarianceNeed: boolean;
  isPointsNeed: boolean;
  isProductCategoryNeed: boolean;
  isProductImageNeed: boolean;
  isProductVarianceNeed: boolean;
  isStatusNeed: boolean;
  isDescriptionNeed: boolean;
  isIsComesUnderRoyaltyNeed: boolean;
}>;

type ProductsFilterInput = Nullish<{
  description: FilterString;
  hasVariance: boolean;
  id: FilterInteger;
  name: FilterString;
  points: FilterFloat;
  productCategoryId: FilterInteger;
  productCategoryName: FilterString;
  status: FilterString;
}>;

type FilterProductsResponse = Nullish<{
  filterProducts: CursorPaginationReturnType<Product>;
}>;

type FilterProductsArgs = CursorPaginationArgs<
  ProductsFilterInput,
  "id" | "name" | "category" | "points"
> &
  ProductsFieldArgs;

type DeleteProductResponse = Nullish<{
  deleteProduct: string;
}>;

interface DeleteProductArgs {
  id: number;
}

type GenerateProductCSVResponse = Nullish<{
  generateProductCSV: string;
}>;

export type {
  Product,
  ProductsFieldArgs,
  ProductsFilterInput,
  FilterProductsResponse,
  FilterProductsArgs,
  DeleteProductResponse,
  DeleteProductArgs,
  GenerateProductCSVResponse,
};
