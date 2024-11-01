import { z } from "zod";

import {
  defaultZodErrorMessage,
  emailZodSchema,
  idAndNameSchema,
  nameZodSchema,
} from "global/helpers";

const saleFormSchema = z
  .object({
    orderingParty: z.union(
      [
        idAndNameSchema(z.number(defaultZodErrorMessage)),
        idAndNameSchema(z.string(defaultZodErrorMessage)),
        idAndNameSchema(z.null()),
      ],
      defaultZodErrorMessage
    ),
    orderingPartyEmail: emailZodSchema().nullish(),
    itemsQuantitiesPrices: z
      .object({
        id: z.number(defaultZodErrorMessage).nullish(),
        item: idAndNameSchema(z.number())
          .and(
            z.object({
              price: z.number().nullish(),
              type: z.union([
                z.literal("product"),
                z.literal("workbook"),
                z.literal("term"),
              ]),
            })
          )
          .nullish(),
        quantity: z.number(defaultZodErrorMessage).nullish(),
        price: z.number(defaultZodErrorMessage).nullish(),
      })
      .array()
      .min(1, { message: defaultZodErrorMessage.required_error }),
    others: z.boolean(defaultZodErrorMessage),
    otherItemsQuantitiesPrices: z
      .object({
        id: z.number(defaultZodErrorMessage).nullish(),
        item: z.string(defaultZodErrorMessage).nullish(),
        quantity: z.number(defaultZodErrorMessage).nullish(),
        price: z.number(defaultZodErrorMessage).nullish(),
      })
      .array(),
    hasDiscount: z.boolean(defaultZodErrorMessage),
    discountAmountDiscountDescription: z
      .object({
        id: z.number().nullish(),
        amount: z.number(defaultZodErrorMessage).nullish(),
        description: nameZodSchema(true).nullish(),
      })
      .array()
      .nullish(),
    remarks: z.string().nullish(),
  })
  .superRefine((data, { addIssue }) => {
    if (
      typeof data?.orderingParty?.id === "string" &&
      (data?.orderingPartyEmail === null ||
        data?.orderingPartyEmail === undefined ||
        data?.orderingPartyEmail?.trim()?.length === 0)
    ) {
      addIssue({
        code: z.ZodIssueCode.custom,
        message: defaultZodErrorMessage?.required_error,
        path: ["orderingPartyEmail"],
      });
    }
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
    if (
      data?.others &&
      (data?.otherItemsQuantitiesPrices?.length === 0 ||
        data?.otherItemsQuantitiesPrices === null ||
        data?.otherItemsQuantitiesPrices === undefined)
    ) {
      addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 1,
        message: "Other item, Price and quantity is required.",
        inclusive: true,
        type: "string",
        path: ["otherItemsQuantitiesPrices"],
      });
    }
    if (data?.itemsQuantitiesPrices?.length === 1) {
      data?.itemsQuantitiesPrices?.forEach(
        ({ item, quantity, price }, index) => {
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
              path: [`itemsQuantitiesPrices.${index}.item`],
            });
          }

          if (quantity === null || quantity === undefined) {
            addIssue({
              code: z.ZodIssueCode.custom,
              message: defaultZodErrorMessage?.required_error,
              path: [`itemsQuantitiesPrices.${index}.quantity`],
            });
          }

          if (price === null || price === undefined) {
            addIssue({
              code: z.ZodIssueCode.custom,
              message: defaultZodErrorMessage?.required_error,
              path: [`itemsQuantitiesPrices.${index}.price`],
            });
          }
        }
      );
    }
    if (data?.itemsQuantitiesPrices?.length > 1) {
      data?.itemsQuantitiesPrices?.forEach(
        ({ item, quantity, price }, index) => {
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
                path: [`itemsQuantitiesPrices.${index}.quantity`],
              });
            }

            if (price === null || price === undefined) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`itemsQuantitiesPrices.${index}.price`],
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
                path: [`itemsQuantitiesPrices.${index}.item`],
              });
            }

            if (price === null || price === undefined) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`itemsQuantitiesPrices.${index}.price`],
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
                path: [`itemsQuantitiesPrices.${index}.item`],
              });
            }

            if (quantity === null || quantity === undefined) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`itemsQuantitiesPrices.${index}.quantity`],
              });
            }
          }
        }
      );
    }
    if (data?.otherItemsQuantitiesPrices?.length === 1) {
      data?.otherItemsQuantitiesPrices?.forEach(
        ({ item, quantity, price }, index) => {
          if (
            item === null ||
            item === undefined ||
            item?.trim()?.length === 0
          ) {
            addIssue({
              code: z.ZodIssueCode.custom,
              message: defaultZodErrorMessage?.required_error,
              path: [`otherItemsQuantitiesPrices.${index}.item`],
            });
          }

          if (quantity === null || quantity === undefined) {
            addIssue({
              code: z.ZodIssueCode.custom,
              message: defaultZodErrorMessage?.required_error,
              path: [`otherItemsQuantitiesPrices.${index}.quantity`],
            });
          }

          if (price === null || price === undefined) {
            addIssue({
              code: z.ZodIssueCode.custom,
              message: defaultZodErrorMessage?.required_error,
              path: [`otherItemsQuantitiesPrices.${index}.price`],
            });
          }
        }
      );
    }
    if (data?.otherItemsQuantitiesPrices?.length > 1) {
      data?.otherItemsQuantitiesPrices?.forEach(
        ({ item, quantity, price }, index) => {
          if (
            item !== null &&
            item !== undefined &&
            item?.trim()?.length !== 0
          ) {
            if (quantity === null || quantity === undefined) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`otherItemsQuantitiesPrices.${index}.quantity`],
              });
            }

            if (price === null || price === undefined) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`otherItemsQuantitiesPrices.${index}.price`],
              });
            }
          }

          if (quantity !== null && quantity !== undefined) {
            if (
              item === null ||
              item === undefined ||
              item?.trim()?.length === 0
            ) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`otherItemsQuantitiesPrices.${index}.item`],
              });
            }

            if (price === null || price === undefined) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`otherItemsQuantitiesPrices.${index}.price`],
              });
            }
          }

          if (price !== null && price !== undefined) {
            if (
              item === null ||
              item === undefined ||
              item?.trim()?.length === 0
            ) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`otherItemsQuantitiesPrices.${index}.item`],
              });
            }

            if (quantity === null || quantity === undefined) {
              addIssue({
                code: z.ZodIssueCode.custom,
                message: defaultZodErrorMessage?.required_error,
                path: [`otherItemsQuantitiesPrices.${index}.quantity`],
              });
            }
          }
        }
      );
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

    return data;
  });

export { saleFormSchema };
