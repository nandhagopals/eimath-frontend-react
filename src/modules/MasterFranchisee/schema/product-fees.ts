import { z } from "zod";

const masterFranchiseeProductFeesSortBySchema = z
  .object({
    column: z.union([
      z.literal("id"),
      z.literal("productName"),
      z.literal("variance"),
      z.literal("category"),
      z.literal("price"),
    ]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

export { masterFranchiseeProductFeesSortBySchema };
