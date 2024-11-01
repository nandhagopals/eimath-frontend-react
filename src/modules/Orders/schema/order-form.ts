import { z } from "zod";

import {
  defaultZodErrorMessage,
  emailZodSchema,
  idAndNameSchema,
} from "global/helpers";

import { orderWithSchema } from "modules/Orders";

const orderFormSchema = z
  .object({
    orderingParty: z.union([
      idAndNameSchema(z.number()),
      idAndNameSchema(z.string()),
      idAndNameSchema(z.null()),
    ]),
    itemQuantityPrice: z
      .object({
        id: z.number(defaultZodErrorMessage).nullish(),
        item: z
          .union([
            idAndNameSchema(z.number(defaultZodErrorMessage)).and(
              z.object({
                price: z.number(defaultZodErrorMessage).nullish(),
                productPoints: z.number(defaultZodErrorMessage).nullish(),
                type: z
                  .union([
                    z.literal("product"),
                    z.literal("workbook"),
                    z.literal("educationalTerm"),
                  ])
                  .nullish(),
              })
            ),
            idAndNameSchema(z.string()).and(
              z.object({
                price: z.number(defaultZodErrorMessage).nullish(),
                productPoints: z.number(defaultZodErrorMessage).nullish(),
                type: z
                  .union([
                    z.literal("product"),
                    z.literal("workbook"),
                    z.literal("educationalTerm"),
                  ])
                  .nullish(),
              })
            ),
          ])
          .nullish(),
        quantity: z.number(defaultZodErrorMessage).nullish(),
        unitPrice: z.number(defaultZodErrorMessage).nullish(),
        recipientOrStudentName: z
          .union([
            idAndNameSchema(z.number()),
            idAndNameSchema(z.string()),
            idAndNameSchema(z.null()),
          ])
          .nullish(),
      })
      .array()
      .min(1, { message: defaultZodErrorMessage.required_error }),
    remarks: z.string(defaultZodErrorMessage).nullish(),
    orderingPartyEmail: emailZodSchema(false).nullish(),
    isFranchisee: z.boolean(),
  })
  .superRefine((data, { addIssue }) => {
    if (data?.itemQuantityPrice?.length === 1) {
      data?.itemQuantityPrice?.forEach(
        ({ item, quantity, unitPrice }, index) => {
          if (
            item === null ||
            item === undefined ||
            item?.id === null ||
            item?.id === undefined ||
            item?.name === null ||
            item?.name === undefined ||
            item?.name?.trim()?.length === 0
          ) {
            addIssue({
              code: z.ZodIssueCode.custom,
              message: defaultZodErrorMessage?.required_error,
              path: [`itemQuantityPrice.${index}.item`],
            });
          }

          if (quantity === null || quantity === undefined) {
            addIssue({
              code: z.ZodIssueCode.custom,
              message: defaultZodErrorMessage?.required_error,
              path: [`itemQuantityPrice.${index}.quantity`],
            });
          }

          if (unitPrice === null || unitPrice === undefined) {
            addIssue({
              code: z.ZodIssueCode.custom,
              message: defaultZodErrorMessage?.required_error,
              path: [`itemQuantityPrice.${index}.unitPrice`],
            });
          }
        }
      );
    }
    if (data?.itemQuantityPrice?.length > 1) {
      data?.itemQuantityPrice?.forEach(
        ({ item, quantity, unitPrice }, index) => {
          if (
            item !== null &&
            item !== undefined &&
            item?.id !== null &&
            item?.id !== undefined &&
            item?.name !== null &&
            item?.name !== undefined &&
            item?.name?.trim()?.length !== 0
          ) {
            if (quantity === null || quantity === undefined) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`itemQuantityPrice.${index}.quantity`],
              });
            }

            if (unitPrice === null || unitPrice === undefined) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`itemQuantityPrice.${index}.unitPrice`],
              });
            }
          }

          if (quantity !== null && quantity !== undefined) {
            if (
              item === null ||
              item === undefined ||
              item?.id === null ||
              item?.id === undefined ||
              item?.name === null ||
              item?.name === undefined ||
              item?.name?.trim()?.length === 0
            ) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`itemQuantityPrice.${index}.item`],
              });
            }

            if (unitPrice === null || unitPrice === undefined) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`itemQuantityPrice.${index}.unitPrice`],
              });
            }
          }

          if (unitPrice !== null && unitPrice !== undefined) {
            if (
              item === null ||
              item === undefined ||
              item?.id === null ||
              item?.id === undefined ||
              item?.name === null ||
              item?.name === undefined ||
              item?.name?.trim()?.length === 0
            ) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`itemQuantityPrice.${index}.item`],
              });
            }

            if (quantity === null || quantity === undefined) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`itemQuantityPrice.${index}.quantity`],
              });
            }
          }
        }
      );
    }

    if (
      data?.isFranchisee &&
      typeof data?.orderingParty?.id === "string" &&
      (data?.orderingPartyEmail === null ||
        data?.orderingPartyEmail === undefined)
    ) {
      addIssue({
        code: z.ZodIssueCode.custom,
        message: defaultZodErrorMessage?.required_error,
        path: ["orderingPartyEmail"],
      });
    }
  });

const orderFormSearchSchema = z.object({
  orderWith: orderWithSchema.nullish(),
});

export { orderFormSchema, orderFormSearchSchema };
