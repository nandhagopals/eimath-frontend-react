import { z } from "zod";

import { emailZodSchema, passwordZodSchema } from "global/helpers";
import { Nullish } from "global/types";

const forgotPasswordFormSchema = z.object({
  email: emailZodSchema(true),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordFormSchema>;

interface ForgotPasswordArgs {
  email: string;
}

type ForgotPasswordResponse = Nullish<{
  sendForgotPasswordMail: string;
}>;

const updatePasswordFormSchema = z
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

type UpdatePasswordForm = z.infer<typeof updatePasswordFormSchema>;

interface UpdatePasswordArgs {
  id: number;
  resetToken: string;
  password: string;
}

type UpdatePasswordResponse = Nullish<{
  updatePassword: string;
}>;

export type {
  ForgotPasswordForm,
  ForgotPasswordArgs,
  ForgotPasswordResponse,
  UpdatePasswordForm,
  UpdatePasswordArgs,
  UpdatePasswordResponse,
};

export { forgotPasswordFormSchema, updatePasswordFormSchema };
