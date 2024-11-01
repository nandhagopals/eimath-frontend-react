import { z } from "zod";

const masterFranchiseeSortBySchema = z
  .object({
    column: z.union([
      z.literal("id"),
      z.literal("ownerName"),
      z.literal("prefix"),
      z.literal("status"),
    ]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

const masterFranchiseeFilterSchema = z.object({
  search: z.string().nullable(),
  pageSize: z.number(),
  filters: z.object({
    status: z
      .union([z.literal("ACTIVE"), z.literal("ARCHIVED")])
      .catch("ACTIVE"),
  }),
  sortBy: masterFranchiseeSortBySchema,
});

export { masterFranchiseeFilterSchema, masterFranchiseeSortBySchema };
