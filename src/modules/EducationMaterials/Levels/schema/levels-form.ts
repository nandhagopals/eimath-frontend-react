import { z } from "zod";

import {
  countryZodSchema,
  defaultZodErrorMessage,
  idAndNameSchema,
  nameZodSchema,
} from "global/helpers";

export const educationalLevelFormSchema = z.object({
  name: nameZodSchema(true),
  country: countryZodSchema,
  remarks: z.string().nullish(),
  educationalTerms: z
    .object(
      {
        educationalTerm: idAndNameSchema(z.number())
          .and(z.object({ status: z.string()?.nullish() }))
          .nullish(),
        position: z.number(defaultZodErrorMessage).nullish(),
      },
      defaultZodErrorMessage
    )
    .array()
    .min(1, { message: defaultZodErrorMessage.required_error })
    .superRefine((value, { addIssue }) => {
      if (
        value?.length === 1 &&
        (value?.[0]?.educationalTerm === null ||
          value?.[0]?.educationalTerm === undefined)
      ) {
        addIssue({
          code: z.ZodIssueCode.invalid_type,
          message: defaultZodErrorMessage.required_error,
          expected: "object",
          received: "null",
          path: [`${0}.educationalTerm`],
        });
      }

      if (
        !value?.every(
          (educationalTerm) =>
            educationalTerm?.educationalTerm?.status === "Active"
        )
      ) {
        value?.forEach((educationalTerm, index) => {
          if (
            educationalTerm?.educationalTerm?.id &&
            educationalTerm?.educationalTerm?.status !== "Active"
          ) {
            addIssue({
              code: z.ZodIssueCode.custom,
              message: "Remove inactive term",
              path: [`${index}.educationalTerm`],
            });
          }
        });
      }

      return value;
    }),
});
