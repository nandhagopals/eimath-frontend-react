import { z } from "zod";

import {
  defaultZodErrorMessage,
  fileUploadSchema,
  idAndNameSchema,
  nameZodSchema,
} from "global/helpers";
import { CommonStatus, Nullish } from "global/types";

import { Product, ProductsFieldArgs } from "modules/Products";

type CreateProductResponse = Nullish<{
  createProduct: Product;
}>;

interface CreateProductArgs extends ProductsFieldArgs {
  name: string;
  productCategoryIds: number[];
  productImage?: File | null;
  points: number;
  description?: string | null;
  hasVariance?: boolean | null;
  productVariances?: { id?: number | null; name: string }[] | null | undefined;
  isComesUnderRoyalty: boolean;
}

type UpdateProductResponse = Nullish<{
  updateProduct: Product;
}>;

interface UpdateProductArgs extends Partial<CreateProductArgs> {
  id: number;
  status?: CommonStatus;
}

const productFormSchema = z.object({
  name: nameZodSchema(true),
  productCategories: idAndNameSchema(z.number()).array(),
  points: z.number(defaultZodErrorMessage),
  productImage: fileUploadSchema({}).nullish(),
  description: z.string().nullish(),
  hasVariance: z.boolean().nullish(),
  productVariances: z
    .object({
      id: z.number().nullish(),
      name: z.string(),
    })
    .array()
    .nullish(),
  isComesUnderRoyalty: z.boolean(),
});

type ProductForm = z.infer<typeof productFormSchema>;

export { productFormSchema };
export type {
  CreateProductResponse,
  CreateProductArgs,
  UpdateProductResponse,
  UpdateProductArgs,
  ProductForm,
};
