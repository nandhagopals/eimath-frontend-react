import { z } from "zod";

import { dateFieldSchema, idAndNameSchema } from "global/helpers";

const withdrawnReportSortBySchema = z
  .object({
    column: z.union([
      z.literal("id"),
      z.literal("year"),
      z.literal("withdrawalCount"),
    ]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

const withdrawnReportFilterSchema = z.object({
  centerName: z.string().nullish(),
  dateRange: z.object({
    start: dateFieldSchema,
    end: dateFieldSchema,
  }),
  pageSize: z.number(),
  sortBy: withdrawnReportSortBySchema,
  masterFranchiseeOrFranchisee: idAndNameSchema(z.number())
    .and(
      z.object({
        fieldType: z.union([
          z.literal("franchisee"),
          z.literal("masterFranchisee"),
        ]),
      })
    )
    ?.nullish(),
});

export { withdrawnReportFilterSchema };
