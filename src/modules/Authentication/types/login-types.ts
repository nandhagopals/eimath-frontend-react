import { z } from "zod";

import { emailZodSchema, passwordZodSchema } from "global/helpers";
import { Nullish } from "global/types";

const loginFormSchema = z.object({
  email: emailZodSchema(true),
  password: passwordZodSchema(false),
});

type LoginForm = z.infer<typeof loginFormSchema>;

type LoginReturn = Nullish<{
  id: number;
  token: string;
}>;

interface LoginArgs {
  email: string;
  password: string;
}

type LoginResponse = Nullish<{
  login: LoginReturn;
}>;

export type { LoginForm, LoginReturn, LoginArgs, LoginResponse };

export { loginFormSchema };
