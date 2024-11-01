import { z } from "zod";

const royaltySortBySchema = z
  .object({
    column: z.union([
      z.literal("id"),
      z.literal("masterFranchiseeId"),
      z.literal("franchiseeId"),
      z.literal("revenue"),
      z.literal("earning"),
      z.literal("status"),
    ]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

export const royaltyFilterSchema = z.object({
  search: z.string().nullable(),
  pageSize: z.number(),
  sortBy: royaltySortBySchema,
  month: z.string().nullish(),
  year: z.number().nullish(),
  accountType: z.union([
    z.literal("ALL"),
    z.literal("PAID"),
    z.literal("UNPAID"),
  ]),
});

export { royaltySortBySchema };
