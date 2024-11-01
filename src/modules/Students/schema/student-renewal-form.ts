import { z } from "zod";

import {
  defaultZodErrorMessage,
  idAndNameSchema,
  nameZodSchema,
} from "global/helpers";

const studentRenewalFormSchema = z
  .object({
    receivingParty: z.string(),
    term: idAndNameSchema(z.number()).nullish(),
    itemQuantityPrice: z
      .object({
        id: z.number().nullish(),
        item: z
          .union([
            idAndNameSchema(z.number(defaultZodErrorMessage)).and(
              z.object({
                price: z.number().nullish(),
                type: z.union([
                  z.literal("product"),
                  z.literal("workbook"),
                  z.literal("term"),
                ]),
              })
            ),
            idAndNameSchema(z.string(defaultZodErrorMessage)).and(
              z.object({
                price: z.number().nullish(),
                type: z
                  .union([
                    z.literal("product"),
                    z.literal("workbook"),
                    z.literal("term"),
                  ])
                  .nullish(),
              })
            ),
          ])
          .nullish(),
        quantity: z.number(defaultZodErrorMessage).nullish(),
        price: z.number(defaultZodErrorMessage).nullish(),
      })
      .array()
      // .min(1, { message: "Must provide item, quantity and price." }),
      .nullish(),

    hasDiscount: z.boolean(defaultZodErrorMessage),
    discountAmountDiscountDescription: z
      .object({
        id: z.number().nullish(),
        amount: z.number(defaultZodErrorMessage).nullish(),
        description: nameZodSchema(false).nullish(),
      })
      .array()
      .nullish(),
    remarks: z.string().nullish(),
  })
  .superRefine((data, { addIssue }) => {
    if (
      data?.hasDiscount &&
      (data?.discountAmountDiscountDescription?.length === 0 ||
        data?.discountAmountDiscountDescription === null ||
        data?.discountAmountDiscountDescription === undefined)
    ) {
      addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 1,
        message: "Discount amount and Description is required.",
        inclusive: true,
        type: "string",
        path: ["discountAmountDiscountDescription"],
      });
    }

    if (data?.discountAmountDiscountDescription?.length === 1) {
      data?.discountAmountDiscountDescription?.forEach(
        ({ amount, description }, index) => {
          if (
            description === null ||
            description === undefined ||
            description?.trim()?.length === 0
          ) {
            addIssue({
              code: z.ZodIssueCode.custom,
              message: defaultZodErrorMessage?.required_error,
              path: [`discountAmountDiscountDescription.${index}.description`],
            });
          }

          if (amount === null || amount === undefined) {
            addIssue({
              code: z.ZodIssueCode.custom,
              message: defaultZodErrorMessage?.required_error,
              path: [`discountAmountDiscountDescription.${index}.amount`],
            });
          }
        }
      );
    }

    if ((data?.discountAmountDiscountDescription?.length ?? 0) > 1) {
      data?.discountAmountDiscountDescription?.forEach(
        ({ amount, description }, index) => {
          if (
            description !== null &&
            description !== undefined &&
            description?.trim()?.length !== 0
          ) {
            if (amount === null || amount === undefined) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`discountAmountDiscountDescription.${index}.amount`],
              });
            }
          }

          if (amount !== null && amount !== undefined) {
            if (
              description === null ||
              description === undefined ||
              description?.trim()?.length === 0
            ) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [
                  `discountAmountDiscountDescription.${index}.description`,
                ],
              });
            }
          }
        }
      );
    }

    if (data?.itemQuantityPrice && data?.itemQuantityPrice?.length > 0) {
      data?.itemQuantityPrice?.forEach(({ item, quantity, price }, index) => {
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

          if (price === null || price === undefined) {
            addIssue({
              code: z.ZodIssueCode.custom,
              message: defaultZodErrorMessage?.required_error,
              path: [`itemQuantityPrice.${index}.price`],
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

          if (price === null || price === undefined) {
            addIssue({
              code: z.ZodIssueCode.custom,
              message: defaultZodErrorMessage?.required_error,
              path: [`itemQuantityPrice.${index}.price`],
            });
          }
        }

        if (price !== null && price !== undefined) {
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
      });
    }
    return data;
  });

export { studentRenewalFormSchema };
