import { z } from "zod";
import { DateValue } from "react-aria-components";

import { listFormat } from "components/Form/FileUpload";

import { defaultMimeTypes, defaultZodErrorMessage } from "global/helpers";

const emailZodSchema = (isRequired: boolean = false) =>
  z
    .string(defaultZodErrorMessage)
    .trim()
    .min(1, { message: defaultZodErrorMessage.required_error })
    .email({
      message: "Invalid email",
    })
    .superRefine((val, { addIssue }) => {
      if (
        isRequired &&
        (val?.length === 0 || val === null || val === undefined)
      ) {
        addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 1,
          message: defaultZodErrorMessage.required_error,
          inclusive: true,
          type: "string",
        });
      }
      if (val?.trim()?.length > 0) {
        const isValid = () => {
          try {
            z.string().email(val?.trim());
            return true;
          } catch {
            return false;
          }
        };

        if (!isValid()) {
          addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid email",
          });
        }
      }
    });

const passwordZodSchema = (showMinLengthErrorMessage: boolean = true) =>
  z.string(defaultZodErrorMessage).superRefine((val, { addIssue }) => {
    if (val?.length === 0 || val === null || val === undefined) {
      addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 1,
        message: defaultZodErrorMessage.required_error,
        inclusive: true,
        type: "string",
      });
    }
    if (val?.length < 8) {
      addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 1,
        message: `Invalid password${
          showMinLengthErrorMessage ? " (Minimum length should be 8)" : ""
        }`,
        inclusive: true,
        type: "string",
      });
    }
  });

const nameZodSchema = (isRequired: boolean = false, minlength: number = 2) =>
  z
    .string(defaultZodErrorMessage)
    .trim()
    .superRefine((val, { addIssue }) => {
      if (
        isRequired &&
        (val?.length === 0 || val === null || val === undefined)
      ) {
        addIssue({
          code: z.ZodIssueCode.custom,
          message: defaultZodErrorMessage.required_error,
        });
      }
      if (val?.length > 0 && val?.length < minlength) {
        addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: minlength,
          message: `Minimum length should be ${minlength}`,
          inclusive: true,
          type: "string",
        });
      }
    });

const bankAccountNumberZodSchema = (isRequired: boolean = false) =>
  z
    .string(defaultZodErrorMessage)
    .trim()
    .superRefine((val, { addIssue }) => {
      if (
        isRequired &&
        (val?.length === 0 || val === null || val === undefined)
      ) {
        addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 1,
          message: defaultZodErrorMessage.required_error,
          inclusive: true,
          type: "string",
        });
      }
      if (val?.length > 0 && val?.length < 5) {
        addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 1,
          message: "Minimum length should be 5",
          inclusive: true,
          type: "string",
        });
      }
    });

const mobileNumberZodSchema = (isRequired: boolean = false) =>
  z
    .string(defaultZodErrorMessage)
    .trim()
    .superRefine((val, { addIssue }) => {
      if (
        isRequired &&
        (val?.length === 0 || val === null || val === undefined)
      ) {
        addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 1,
          message: defaultZodErrorMessage.required_error,
          inclusive: true,
          type: "string",
        });
      }
      if (val?.length > 0 && val?.length < 4) {
        addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 1,
          message: "Minimum length should be 4",
          inclusive: true,
          type: "string",
        });
      }
      if (val?.length > 0 && val?.length > 20) {
        addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 1,
          message: "Maximum length should be less than 20",
          inclusive: true,
          type: "string",
        });
      }
    });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setZodRefineFunction = (schema: any) => (data: any) => {
  const set = new Set(data);
  return set.size === data.length
    ? schema.parse(data)
    : new Error("Elements must be unique");
};

const setZodSchema = <T>(schema: z.ZodType<T>) =>
  z.array(schema).refine(setZodRefineFunction);

const idAndNameSchema = <T extends string | number | null = number>(
  type: z.ZodType<T>
) =>
  z.object(
    {
      id: type,
      name: z.string(),
    },
    defaultZodErrorMessage
  );

const isURL = (data: string | undefined | null) => {
  if (data) {
    try {
      z.string().url().parse(data);
      return true;
    } catch {
      return false;
    }
  } else {
    return false;
  }
};

const fileUploadSchema = ({
  mimeTypes = defaultMimeTypes,
  fileSizeInMB = 25,
}: {
  mimeTypes?: string[];
  fileSizeInMB?: number;
}) => {
  const MAX_UPLOAD_SIZE = 1024 * 1024 * fileSizeInMB;
  const ACCEPTED_FILE_TYPES = mimeTypes;

  return z.object({
    id: z.union([z.string(), z.number()]),
    file: z.instanceof(File).refine((file) => {
      if (!file) return true;
      return (
        file.size <= MAX_UPLOAD_SIZE && ACCEPTED_FILE_TYPES.includes(file.type)
      );
    }, `File size must be less than ${fileSizeInMB}MB and of type ${listFormat.format(mimeTypes?.map((type) => `.${type?.split("/")[1]}`))}`),
  });
};

const countryZodSchema = idAndNameSchema(z.number())
  .and(z.object({ status: z.string()?.nullish() }))
  .superRefine((value, { addIssue }) => {
    if (value?.status !== "Active") {
      addIssue({
        code: z.ZodIssueCode.custom,
        message: "Remove inactive country",
      });
    }

    return value;
  });

const dateFieldSchema = z.custom<DateValue>((value) => {
  if (value === null || value === undefined) {
    return false;
  }

  return value;
}, defaultZodErrorMessage?.required_error);

export {
  emailZodSchema,
  passwordZodSchema,
  nameZodSchema,
  bankAccountNumberZodSchema,
  mobileNumberZodSchema,
  setZodRefineFunction,
  setZodSchema,
  idAndNameSchema,
  isURL,
  fileUploadSchema,
  countryZodSchema,
  dateFieldSchema,
};
