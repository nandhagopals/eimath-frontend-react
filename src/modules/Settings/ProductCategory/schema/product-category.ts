import { z } from "zod";

const productCategorySortBySchema = z
  .object({
    column: z.union([z.literal("id"), z.literal("name")]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

const productCategoryFilterSchema = z.object({
  search: z.string().nullable(),
  pageSize: z.number(),
  sortBy: productCategorySortBySchema,
});

export { productCategoryFilterSchema };
