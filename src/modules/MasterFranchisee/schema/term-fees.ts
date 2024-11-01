import { z } from "zod";

const masterFranchiseeTermFeesSortBySchema = z
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

export { masterFranchiseeTermFeesSortBySchema };
