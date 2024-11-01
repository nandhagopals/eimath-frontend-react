import { z } from "zod";

import {
  defaultZodErrorMessage,
  emailZodSchema,
  idAndNameSchema,
  nameZodSchema,
} from "global/helpers";
import { mobileInputSchema } from "components/Form";

const studentKinRelationshipSchema = z.union(
  [
    z.literal("Father"),
    z.literal("Mother"),
    z.literal("Guardian"),
    z.literal("Spouse"),
    z.literal("Other"),
  ],
  defaultZodErrorMessage
);

const studentFormSchema = z
  .object({
    name: nameZodSchema(true),
    masterFranchiseeInformation: idAndNameSchema(z.number()).and(
      z.object({ currency: z.string().nullish() })
    ),
    educationalLevel: idAndNameSchema(z.number()),
    franchisee: idAndNameSchema(z.number()),
    educationalTerm: idAndNameSchema(z.number()),
    educationalCategory: idAndNameSchema(z.number()),
    studentKins: z
      .object({
        id: z.number().nullish(),
        name: nameZodSchema(true),
        relationship: studentKinRelationshipSchema,
        isPrimaryContact: z.boolean(defaultZodErrorMessage),
        mobile: mobileInputSchema,
        email: emailZodSchema(true),
        address: nameZodSchema(true),
        postalCode: z.object(
          {
            country: idAndNameSchema(z.number()),
            postalCode: nameZodSchema(true, 2),
          },
          defaultZodErrorMessage
        ),
      })
      .array()
      .min(1, { message: defaultZodErrorMessage.required_error }),
    hasDiscount: z.boolean(defaultZodErrorMessage),
    discountDetails: z
      .object({
        id: z.number().nullish(),
        discountAmount: z.number(defaultZodErrorMessage).nullish(),
        description: z.string(defaultZodErrorMessage).nullish(),
      })
      .array()
      .nullish(),
  })
  .superRefine((data, { addIssue }) => {
    if (
      data?.studentKins?.every(
        (studentKin) => studentKin?.isPrimaryContact === false
      )
    ) {
      addIssue({
        code: z.ZodIssueCode.custom,
        message: "Must provide one primary contact kin.",
        path: ["studentKins"],
      });
    }

    if (
      data?.hasDiscount &&
      (data?.discountDetails === null ||
        data?.discountDetails === undefined ||
        data?.discountDetails?.length === 0)
    ) {
      addIssue({
        code: z.ZodIssueCode.custom,
        message: "Must provide discount detail.",
        path: ["hasDiscount"],
      });
    }

    if (data?.discountDetails?.length === 1) {
      data?.discountDetails?.forEach(
        ({ discountAmount, description }, index) => {
          if (
            description === null ||
            description === undefined ||
            description?.trim()?.length === 0
          ) {
            addIssue({
              code: z.ZodIssueCode.custom,
              message: defaultZodErrorMessage?.required_error,
              path: [`discountDetails.${index}.description`],
            });
          }

          if (discountAmount === null || discountAmount === undefined) {
            addIssue({
              code: z.ZodIssueCode.custom,
              message: defaultZodErrorMessage?.required_error,
              path: [`discountDetails.${index}.discountAmount`],
            });
          }
        }
      );
    }
    if ((data?.discountDetails?.length ?? 0) > 1) {
      data?.discountDetails?.forEach(
        ({ discountAmount, description }, index) => {
          if (
            description !== null &&
            description !== undefined &&
            description?.trim()?.length !== 0
          ) {
            if (discountAmount === null || discountAmount === undefined) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`discountDetails.${index}.discountAmount`],
              });
            }
          }

          if (discountAmount !== null && discountAmount !== undefined) {
            if (
              description === null ||
              description === undefined ||
              description?.trim()?.length === 0
            ) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`discountDetails.${index}.description`],
              });
            }
          }
        }
      );
    }

    return data;
  });

export { studentFormSchema, studentKinRelationshipSchema };
