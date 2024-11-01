import { z } from "zod";

import { mobileInputSchema } from "components/Form";

import {
  defaultZodErrorMessage,
  emailZodSchema,
  idAndNameSchema,
  nameZodSchema,
} from "global/helpers";

const masterFranchiseeInformationFormSchema = z
  .object({
    name: nameZodSchema(true),
    email: emailZodSchema(true),
    mobile: mobileInputSchema,
    currencyCountry: idAndNameSchema(z.number(defaultZodErrorMessage)).and(
      z.object({
        currency: z.string(),
      })
    ),
    inSingapore: z.union(
      [z.literal("Yes"), z.literal("No")],
      defaultZodErrorMessage
    ),
    masterFranchiseeName: nameZodSchema(true),
    companyName: nameZodSchema(true),
    educationalCategories: idAndNameSchema(z.number())
      .array()
      .min(1, { message: defaultZodErrorMessage.required_error }),
    prefix: nameZodSchema(true),
    companyUEN: nameZodSchema(true),
    revenueRoyalties: z.number(defaultZodErrorMessage)?.nullish(),
    royaltiesFromFranchisee: z.number(defaultZodErrorMessage)?.nullish(),
    address: nameZodSchema(true),
    postalCode: z.object(
      {
        country: idAndNameSchema(z.number()),
        postalCode: nameZodSchema(true, 2),
      },
      defaultZodErrorMessage
    ),
    pricePerSGD: z.number().nullish(),
  })
  .superRefine((data, { addIssue }) => {
    if (
      data?.currencyCountry?.name !== "Singapore" &&
      (data?.pricePerSGD === null || data?.pricePerSGD === undefined)
    ) {
      addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pricePerSGD"],
        message: "Must provide Price per SGD.",
      });
    }

    return data;
  });

export { masterFranchiseeInformationFormSchema };
