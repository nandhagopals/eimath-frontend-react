import { z } from "zod";

import { dateFieldSchema, idAndNameSchema } from "global/helpers";

const studentReportSortBySchema = z
  .object({
    column: z.union([
      z.literal("id"),
      z.literal("year"),
      z.literal("totalNewStudent"),
      z.literal("totalDiscontinuedStudent"),
      z.literal("totalActiveStudent"),
      z.literal("totalGraduated"),
    ]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

const studentReportFilterSchema = z.object({
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
  dateRange: z.object({
    start: dateFieldSchema,
    end: dateFieldSchema,
  }),
  pageSize: z.number(),
  sortBy: studentReportSortBySchema,
});

export { studentReportFilterSchema };
