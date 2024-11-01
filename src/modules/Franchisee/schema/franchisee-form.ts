import { z } from "zod";

import { mobileInputSchema } from "components/Form";

import {
  defaultZodErrorMessage,
  emailZodSchema,
  idAndNameSchema,
  nameZodSchema,
} from "global/helpers";

const franchiseeFormSchema = z.object({
  name: nameZodSchema(true),
  franchiseeName: nameZodSchema(true),
  email: emailZodSchema(true),
  mobile: mobileInputSchema,
  homeAddress: nameZodSchema(true, 1),
  companyName: nameZodSchema(true, 1),
  companyUEN: nameZodSchema(true, 1),
  prefix: nameZodSchema(true, 1),
  // bankAccountNumber: nameZodSchema(true, 1).nullish(),
  address: nameZodSchema(true),
  postalCode: z.object(
    {
      country: idAndNameSchema(z.number()),
      postalCode: nameZodSchema(true, 2),
    },
    defaultZodErrorMessage
  ),
  educationalCategories: idAndNameSchema(z.number())
    .array()
    .min(1, { message: defaultZodErrorMessage.required_error }),
  masterFranchisee: idAndNameSchema(z.number()),
});

export { franchiseeFormSchema };
