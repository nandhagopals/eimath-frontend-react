import { z } from "zod";

const franchiseesSortBySchema = z
  .object({
    column: z.union([
      z.literal("id"),
      z.literal("name"),
      z.literal("prefix"),
      z.literal("country"),
      z.literal("mobileNumber"),
      z.literal("email"),
    ]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

const franchiseeFilterSchema = z.object({
  search: z.string().nullish(),
  pageSize: z.number().nullish(),
  status: z.record(z.number(), z.boolean()),
  filters: z.object({
    status: z.union([z.literal("ACTIVE"), z.literal("ARCHIVED")]),
    role: z
      .object({
        id: z.number(),
        name: z.string(),
      })
      .nullish(),
  }),
  sortBy: franchiseesSortBySchema,
});

export { franchiseesSortBySchema, franchiseeFilterSchema };
