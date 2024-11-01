import { defaultZodErrorMessage } from "global/helpers";
import { z } from "zod";

const notificationStatusSchema = z.union(
  [z.literal("Read"), z.literal("Delete")],
  defaultZodErrorMessage
);

const notificationFilterSchema = z.object({
  pageSize: z.number().nullish().catch(null),
  cursor: z
    .object({
      type: z.union([z.literal("before"), z.literal("after")]).nullish(),
      cursor: z.string().nullish(),
    })
    .nullish()
    .catch(null),
  bunkAction: notificationStatusSchema.nullish(),
});

export { notificationFilterSchema, notificationStatusSchema };
