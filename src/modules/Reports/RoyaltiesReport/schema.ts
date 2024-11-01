import { dateFieldSchema } from "global/helpers";
import { z } from "zod";

const royaltiesReportSortBySchema = z
  .object({
    column: z.union([z.literal("id"), z.literal("date"), z.literal("amount")]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

const royaltiesReportFilterSchema = z.object({
  dateRange: z.object({
    start: dateFieldSchema,
    end: dateFieldSchema,
  }),
  pageSize: z.number(),
  sortBy: royaltiesReportSortBySchema,
});

export { royaltiesReportFilterSchema };
