import { z } from "zod";

import {
  bankAccountNumberZodSchema,
  defaultZodErrorMessage,
  emailZodSchema,
  idAndNameSchema,
  nameZodSchema,
  passwordZodSchema,
} from "global/helpers";

import { mobileInputSchema } from "components/Form";

const profileFormSchema = z.object({
  name: nameZodSchema(true),
  companyName: nameZodSchema(true),
  companyUEN: nameZodSchema(true),
  bankAccountNumber: bankAccountNumberZodSchema(true),
  mobileNumber: mobileInputSchema,
  email: emailZodSchema(true),
  password: passwordZodSchema()?.nullish(),
  address: nameZodSchema(true),
  postalCode: z.object(
    {
      country: idAndNameSchema(z.number()),
      postalCode: nameZodSchema(true, 2),
    },
    defaultZodErrorMessage
  ),
});

export { profileFormSchema };
