import { z } from "zod";

import {
  defaultZodErrorMessage,
  idAndNameSchema,
  nameZodSchema,
} from "global/helpers";

const masterFranchiseePriceOrPointFormSchema = z.object({
  priceOrPoint: z.number(defaultZodErrorMessage),
  name: nameZodSchema().nullish(),
  countryOrCategory: z.union([
    idAndNameSchema(z.number()).nullish(),
    idAndNameSchema(z.number()).array().nullish(),
  ]),
  description: z.string(defaultZodErrorMessage).nullish(),
  workbookInformation: idAndNameSchema(z.number())
    .and(z.object({ status: z.string()?.nullish() }))
    .array()
    .nullish(),
});

export { masterFranchiseePriceOrPointFormSchema };
