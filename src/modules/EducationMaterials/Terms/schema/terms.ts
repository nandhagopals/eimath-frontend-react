import { z } from "zod";

const termsSortBySchema = z
  .object({
    column: z.union([
      z.literal("id"),
      z.literal("name"),
      z.literal("country"),
      z.literal("price"),
    ]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

const termsFilterSchema = z.object({
  search: z.string().nullable(),
  pageSize: z.number(),
  filters: z.object({
    status: z
      .union([z.literal("ACTIVE"), z.literal("ARCHIVED")])
      .catch("ACTIVE"),
  }),
  country: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .nullish(),
  sortBy: termsSortBySchema,
});

export { termsFilterSchema, termsSortBySchema };
