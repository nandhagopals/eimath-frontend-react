import { z } from "zod";

import { idAndNameSchema } from "global/helpers";

const educationCategorySortBySchema = z
  .object({
    column: z.union([z.literal("id"), z.literal("name")]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

const educationCategoryFilterSchema = z.object({
  search: z.string().nullable(),
  pageSize: z.number(),
  filters: z.object({
    status: z
      .union([z.literal("ACTIVE"), z.literal("ARCHIVED")])
      .catch("ACTIVE"),
  }),
  country: idAndNameSchema(z.number()).nullish(),
  sortBy: educationCategorySortBySchema,
});

export { educationCategoryFilterSchema, educationCategorySortBySchema };
