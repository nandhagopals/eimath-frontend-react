import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

type ProductCategory = Nullish<{
  id: number;
  name: string;
}>;

type FilterProductCategoryResponse = Nullish<{
  filterProductCategories: CursorPaginationReturnType<ProductCategory>;
}>;

type ProductCategoriesFilterInput = Nullish<{
  id: FilterInteger;
  name: FilterString;
}>;

type FilterProductCategoriesArgs = CursorPaginationArgs<
  ProductCategoriesFilterInput,
  "id" | "name"
>;

type DeleteProductCategoryResponse = Nullish<{
  deleteProductCategory: string;
}>;

interface DeleteProductCategoryArgs {
  id: number;
}

type GenerateProductCategoryCSVResponse = Nullish<{
  generateProductCategoryCSV: string;
}>;

export type {
  ProductCategory,
  FilterProductCategoryResponse,
  FilterProductCategoriesArgs,
  DeleteProductCategoryResponse,
  DeleteProductCategoryArgs,
  ProductCategoriesFilterInput,
  GenerateProductCategoryCSVResponse,
};
