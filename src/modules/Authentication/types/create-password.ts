import { z } from "zod";

import { passwordZodSchema } from "global/helpers";
import { Nullish } from "global/types";

const createPasswordFormSchema = z
  .object({
    newPassword: passwordZodSchema(),
    confirmNewPassword: passwordZodSchema(),
  })
  .superRefine((value, { addIssue }) => {
    if (value?.newPassword !== value?.confirmNewPassword) {
      addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password not tally.",
        path: ["confirmNewPassword"],
      });
    }
  });

type CreatePasswordForm = z.infer<typeof createPasswordFormSchema>;

interface CreatePasswordArgs {
  id: number;
  confirmationToken: string;
  password: string;
}

type CreatePasswordResponse = Nullish<{
  createPassword: string;
}>;

export type { CreatePasswordForm, CreatePasswordArgs, CreatePasswordResponse };

export { createPasswordFormSchema };
