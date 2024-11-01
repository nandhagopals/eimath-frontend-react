import { z } from "zod";

import { defaultZodErrorMessage, passwordZodSchema } from "global/helpers";

const masterFranchiseeGeneralFormSchema = z.object({
  gstPercentage: z.number(defaultZodErrorMessage).nullish(),
  registrationFee: z.number(defaultZodErrorMessage).nullish(),
  depositFee: z.number(defaultZodErrorMessage).nullish(),
  staffEmail: z
    .string(defaultZodErrorMessage)
    .trim()
    .refine(
      (value) => {
        return (
          value === null ||
          value === undefined ||
          value === "" ||
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        );
      },
      {
        message: "Invalid email",
        params: { showEmptyError: false },
      }
    )
    .nullish(),
  staffPassword: passwordZodSchema().nullish(),
  enableGST: z.boolean(defaultZodErrorMessage).nullish(),
});

export { masterFranchiseeGeneralFormSchema };
