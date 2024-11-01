import { z } from "zod";

import {
  dateFieldSchema,
  defaultZodErrorMessage,
  nameZodSchema,
} from "global/helpers";

const paymentVoucherFormSchema = z.object({
  payee: z.object(
    { id: z.string().or(z.number()), name: z.string() },
    defaultZodErrorMessage
  ),
  description: nameZodSchema(true),
  date: dateFieldSchema,
  amount: z.number(defaultZodErrorMessage),
  remarks: z.string().nullish(),
});

export { paymentVoucherFormSchema };
