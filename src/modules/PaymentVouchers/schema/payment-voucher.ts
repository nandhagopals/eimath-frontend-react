import { z } from "zod";

const paymentVoucherSortBySchema = z
  .object({
    column: z.union([
      z.literal("id"),
      z.literal("payee"),
      z.literal("dateAndTime"),
      z.literal("amount"),
    ]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

export { paymentVoucherSortBySchema };
