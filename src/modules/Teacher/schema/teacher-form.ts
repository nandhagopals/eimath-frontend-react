import { z } from "zod";

import { mobileInputSchema } from "components/Form";

import {
  defaultZodErrorMessage,
  nameZodSchema,
  dateFieldSchema,
} from "global/helpers";

const teacherFormSchema = z.object({
  name: nameZodSchema(true),
  email: z
    .string(defaultZodErrorMessage)
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email."),
  mobile: mobileInputSchema,
  joinDate: dateFieldSchema,
  masterFranchiseInformation: z.object(
    {
      id: z.number(),
      name: z.string(),
    },
    defaultZodErrorMessage
  ),
  franchiseInformation: z.object(
    {
      id: z.number(),
      name: z.string(),
      prefix: z.string(defaultZodErrorMessage).nullish(),
    },
    defaultZodErrorMessage
  ),
});

export { teacherFormSchema };
