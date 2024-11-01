import { z } from "zod";

import { nameZodSchema } from "global/helpers";
import { Nullish } from "global/types";

import { ProductCategory } from "modules/Settings/ProductCategory";

type CreateProductCategoryResponse = Nullish<{
  createProductCategory: ProductCategory;
}>;

interface CreateProductCategoryArgs {
  name: string;
}

type UpdateProductCategoryResponse = Nullish<{
  updateProductCategory: ProductCategory;
}>;

interface UpdateProductCategoryArgs extends Partial<CreateProductCategoryArgs> {
  id: number;
}

const productCategoryFormSchema = z.object({
  name: nameZodSchema(true),
});

type ProductCategoryForm = z.infer<typeof productCategoryFormSchema>;
export { productCategoryFormSchema };
export type {
  CreateProductCategoryResponse,
  CreateProductCategoryArgs,
  UpdateProductCategoryResponse,
  UpdateProductCategoryArgs,
  ProductCategoryForm,
};
