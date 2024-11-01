import { z } from "zod";

import {
  countryZodSchema,
  defaultZodErrorMessage,
  idAndNameSchema,
  nameZodSchema,
} from "global/helpers";

const educationTermFormSchema = z.object({
  name: nameZodSchema(true),
  price: z.number(),
  country: countryZodSchema,
  remarks: z.string().nullish(),
  workbookInformation: idAndNameSchema(z.number())
    .and(z.object({ status: z.string()?.nullish() }))
    .array()
    .min(1, { message: defaultZodErrorMessage?.required_error })
    .superRefine((value, { addIssue }) => {
      if (
        !value?.every((workbookValue) => workbookValue?.status === "Active")
      ) {
        addIssue({
          code: z.ZodIssueCode.custom,
          message: "Remove inactive workbooks",
        });
      }

      return value;
    }),
});

export { educationTermFormSchema };
