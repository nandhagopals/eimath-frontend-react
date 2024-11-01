import { z } from "zod";

import { dateFieldSchema } from "global/helpers";

const salesReportSortBySchema = z
  .object({
    column: z.union([z.literal("id"), z.literal("year"), z.literal("amount")]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

const salesReportFilterSchema = z.object({
  dateRange: z.object({
    start: dateFieldSchema,
    end: dateFieldSchema,
  }),
  pageSize: z.number(),
  sortBy: salesReportSortBySchema,
});

export { salesReportFilterSchema };
