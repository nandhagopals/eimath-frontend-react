import { z } from "zod";

const viewRoyaltySortBySchema = z
  .object({
    column: z.union([
      z.literal("id"),
      z.literal("franchiseeId"),
      z.literal("royaltiesCollected"),
      z.literal("revenue"),
      z.literal("status"),
    ]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

const viewRoyaltyFilterSchema = z.object({
  pageSize: z.number(),
  sortBy: viewRoyaltySortBySchema,
  month: z.string().nullish(),
  year: z.number().nullish(),
  status: z.union([
    z.literal("Paid"),
    z.literal("Unpaid"),
    z.literal("To process"),
    z.literal("Deleted"),
  ]),
});

export { viewRoyaltyFilterSchema, viewRoyaltySortBySchema };
