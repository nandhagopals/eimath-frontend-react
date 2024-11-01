import { z } from "zod";

const paymentReportSortBySchema = z
  .object({
    column: z.union([
      z.literal("id"),
      z.literal("invoiceNo"),
      z.literal("billDate"),
      z.literal("dueDate"),
      z.literal("amountDue"),
      z.literal("status"),
    ]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

const paymentReportFilterSchema = z.object({
  month: z.string(),
  year: z.number(),
  pageSize: z.number(),
  sortBy: paymentReportSortBySchema,
});

export { paymentReportFilterSchema, paymentReportSortBySchema };
