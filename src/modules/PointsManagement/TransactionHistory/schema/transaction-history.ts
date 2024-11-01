import { z } from "zod";

import { dateFieldSchema, defaultZodErrorMessage } from "global/helpers";

const paymentMethodSchema = z.union([
  z.literal("Offline payment"),
  z.literal("Credit card"),
]);

const pointsTransactionHistorySortBySchema = z
  .object({
    column: z.union([
      z.literal("id"),
      z.literal("franchiseeId"),
      z.literal("type"),
      z.literal("points"),
      z.literal("date"),
    ]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

const purchaseOfPointsFormSchema = z
  .object({
    numberOfPoints: z
      .number()
      .min(10, {
        message: "Minimum should be 10",
      })
      .nullish(),
    pointsOptions: z
      .union([
        z.literal("10 POINTS"),
        z.literal("50 POINTS"),
        z.literal("100 POINTS"),
      ])
      .nullish(),
    paymentMethod: paymentMethodSchema.nullish(),
    type: z.union([z.literal("Form"), z.literal("Summary")]),
  })
  .superRefine((data, { addIssue }) => {
    if (
      data?.type === "Summary" &&
      (data?.paymentMethod === null || data?.paymentMethod === undefined)
    ) {
      addIssue({
        code: z.ZodIssueCode.custom,
        message: defaultZodErrorMessage.required_error,
        path: ["paymentMethod"],
      });
    }

    if (
      data?.type === "Form" &&
      (data?.numberOfPoints === null || data?.numberOfPoints === undefined)
    ) {
      addIssue({
        code: z.ZodIssueCode.custom,
        message: defaultZodErrorMessage.required_error,
        path: ["numberOfPoints"],
      });
    }
    if (
      data?.type === "Form" &&
      (data?.pointsOptions === null || data?.pointsOptions === undefined)
    ) {
      addIssue({
        code: z.ZodIssueCode.custom,
        message: defaultZodErrorMessage.required_error,
        path: ["pointsOptions"],
      });
    }

    return data;
  });

const transactionHistoryFilterSchema = z.object({
  search: z.string().nullable(),
  pageSize: z.number(),
  date: z
    .object({
      start: dateFieldSchema.nullish(),
      end: dateFieldSchema.nullish(),
    })
    .nullish(),
  type: z.string().nullish(),
  sortBy: pointsTransactionHistorySortBySchema,
});

export {
  pointsTransactionHistorySortBySchema,
  purchaseOfPointsFormSchema,
  transactionHistoryFilterSchema,
  paymentMethodSchema,
};
