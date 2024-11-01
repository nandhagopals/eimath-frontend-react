import { z } from "zod";

const teacherSortBySchema = z
  .object({
    column: z.union([
      z.literal("id"),
      z.literal("name"),
      z.literal("masterFranchisee"),
      z.literal("shortName"),
    ]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

const teacherFilterSchema = z.object({
  search: z.string().nullable(),
  pageSize: z.number(),
  filters: z.object({
    status: z
      .union([z.literal("ACTIVE"), z.literal("ARCHIVED")])
      .catch("ACTIVE"),
  }),
  sortBy: teacherSortBySchema,
});

export { teacherSortBySchema, teacherFilterSchema };
