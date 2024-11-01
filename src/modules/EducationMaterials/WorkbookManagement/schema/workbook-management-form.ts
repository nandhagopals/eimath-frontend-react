import { z } from "zod";

import {
  countryZodSchema,
  defaultZodErrorMessage,
  fileUploadSchema,
  nameZodSchema,
} from "global/helpers";

const workbookInformationFormSchema = z.object({
  name: nameZodSchema(true),
  price: z.number(defaultZodErrorMessage),
  country: countryZodSchema,
  workbookFiles: fileUploadSchema({}).array().nullish(),
  workbookAnswerFiles: fileUploadSchema({}).array().nullish(),
  remarks: z.string().nullish(),
});

export { workbookInformationFormSchema };
