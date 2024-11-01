import { z } from "zod";

import {
  countryZodSchema,
  defaultZodErrorMessage,
  idAndNameSchema,
  nameZodSchema,
} from "global/helpers";

const educationalCategoryFormSchema = z.object({
  name: nameZodSchema(true),
  country: countryZodSchema,
  educationCategoryLevels: z
    .object(
      {
        educationalLevel: idAndNameSchema(z.number())
          .and(z.object({ status: z.string().nullish() }))
          .nullish(),
        isFinalTerm: z.boolean(),
      },
      defaultZodErrorMessage
    )
    .array()
    .min(1, { message: defaultZodErrorMessage.required_error })
    .superRefine((data, { addIssue }) => {
      if (
        data?.length === 1 &&
        (data?.[0]?.educationalLevel === null ||
          data?.[0]?.educationalLevel === undefined)
      ) {
        addIssue({
          code: z.ZodIssueCode.invalid_type,
          message: defaultZodErrorMessage.required_error,
          expected: "object",
          received: "null",
          path: [`${0}.educationalLevel`],
        });
      }

      if (
        data?.some(
          (educationalCategoryLevel) =>
            educationalCategoryLevel?.educationalLevel?.id
        ) &&
        data?.filter(
          (educationalCategoryLevel) => educationalCategoryLevel?.isFinalTerm
        )?.length === 0
      ) {
        addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must provide final term detail.",
        });
      }

      if (
        !data?.every(
          (educationalCategoryLevel) =>
            educationalCategoryLevel?.educationalLevel?.status === "Active"
        )
      ) {
        data?.forEach((educationalCategoryLevel, index) => {
          if (
            educationalCategoryLevel?.educationalLevel?.id &&
            educationalCategoryLevel?.educationalLevel?.status !== "Active"
          ) {
            addIssue({
              code: z.ZodIssueCode.custom,
              message: "Remove inactive level",
              path: [`${index}.educationalLevel`],
            });
          }
        });
      }
      return data;
    }),
  remarks: z.string().nullish(),
});

export { educationalCategoryFormSchema };
