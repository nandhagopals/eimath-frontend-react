import { defaultZodErrorMessage } from "global/helpers";
import { z } from "zod";

const pointsSortBySchema = z
  .object({
    column: z.union([
      z.literal("id"),
      z.literal("masterFranchiseeId"),
      z.literal("pointsAvailable"),
      z.literal("lastUpdated"),
    ]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

const pointsTransferFormSchema = z.object({
  type: z.union([z.literal("Add Points"), z.literal("Deduct Points")]),
  points: z
    .number(defaultZodErrorMessage)
    .positive({ message: "Must be positive value" }),
  remarks: z.string().nullish(),
});

export { pointsSortBySchema, pointsTransferFormSchema };
