import { z } from "zod";

import { dateFieldSchema } from "global/helpers";

const orderWithSchema = z.union([
  z.literal("ORDER WITH HQ"),
  z.literal("WITH FRANCHISEE"),
  z.literal("PENDING"),
  z.literal("PROCESSED"),
]);

const orderStatusSchema = z.union([
  z.literal("Pending"),
  z.literal("Edited"),
  z.literal("Order sent"),
  z.literal("Invoiced"),
  z.literal("To process"),
  z.literal("Shipped"),
  z.literal("Canceled"),
]);

const orderTypeSchema = z.union([
  z.literal("Order in"),
  z.literal("Order out"),
  z.literal("Recurring"),
  z.literal("New order"),
  z.literal("Ad hoc"),
]);

const orderSortBySchema = z
  .object({
    column: z.union([
      z.literal("id"),
      z.literal("orderId"),
      z.literal("orderParty"),
      z.literal("dateOfCreation"),
      z.literal("points"),
      z.literal("status"),
      z.literal("type"),
    ]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

const orderFilterSchema = z.object({
  search: z.string().nullable(),
  pageSize: z.number(),
  status: orderStatusSchema.nullish(),
  orderType: orderTypeSchema.nullish(),
  date: z
    .object({
      start: dateFieldSchema.nullish(),
      end: dateFieldSchema.nullish(),
    })
    .nullish(),
  sortBy: orderSortBySchema.nullish(),
  bulkAction: z.literal("Confirm Order").nullish(),
  orderWith: orderWithSchema.nullish(),
  pageStatus: z.union([z.literal("ORDERS"), z.literal("CANCELLED")]),
});

export {
  orderFilterSchema,
  orderSortBySchema,
  orderStatusSchema,
  orderTypeSchema,
  orderWithSchema,
};
