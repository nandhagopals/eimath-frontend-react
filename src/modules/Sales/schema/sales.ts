import { dateFieldSchema } from "global/helpers";
import { z } from "zod";

const salesSortBySchema = z
  .object({
    column: z
      .union([
        z.literal("id"),
        z.literal("receiptId"),
        z.literal("receivingParty"),
        z.literal("dateOfCreation"),
        z.literal("lastModifiedDate"),
        z.literal("paymentMethod"),
        z.literal("type"),
      ])
      .nullish(),
    direction: z
      .union([z.literal("ascending"), z.literal("descending")])
      .nullish(),
  })
  .nullish();

const invoicePaymentMethodSchema = z.union([
  z.literal("Cash"),
  z.literal("Pay now"),
  z.literal("Credit card"),
]);

const salesFilterSchema = z
  .object({
    search: z.string().nullish().catch(null),
    pageStatus: z
      .union([z.literal("CANCELLED"), z.literal("INVOICE/RECEIPT")])
      .catch("INVOICE/RECEIPT"),
    pageSize: z.number().nullish().catch(null),
    cursor: z
      .object({
        type: z.union([z.literal("before"), z.literal("after")]).nullish(),
        cursor: z.string().nullish(),
      })
      .nullish()
      .catch(null),
    sortBy: salesSortBySchema.nullish().catch(null),
    type: z.string().nullish(),
    pageType: z.string().nullish(),
    dateRange: z
      .object({
        start: dateFieldSchema.nullish(),
        end: dateFieldSchema.nullish(),
      })
      .nullish(),
    fromHQOrWithFranchisee: z
      .union([z.literal("FROM HQ"), z.literal("WITH FRANCHISEE")])
      .nullish(),
    paymentMethod: invoicePaymentMethodSchema.nullish(),
    numberOfPoints: z.number().nullish(),
    bulkAction: z.literal("Paid").nullish(),
  })
  .catch({
    pageStatus: "INVOICE/RECEIPT",
  });

export { salesSortBySchema, salesFilterSchema, invoicePaymentMethodSchema };
