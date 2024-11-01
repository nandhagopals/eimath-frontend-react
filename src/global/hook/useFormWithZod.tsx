import {
  FieldValues,
  UseFormProps,
  useForm as useFormReactHookForm,
} from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "global/helpers";

/* eslint-disable @typescript-eslint/no-explicit-any */
const useFormWithZod = <
  T extends z.Schema<any, any>,
  TContext = any,
  TTransformedValues extends FieldValues = z.infer<T>
>({
  schema,
  context,
  criteriaMode,
  defaultValues,
  delayError,
  disabled,
  errors,
  mode,
  progressive,
  reValidateMode,
  resetOptions,
  shouldFocusError,
  shouldUnregister,
  shouldUseNativeValidation,
  values,
}: { schema: T } & Omit<UseFormProps<z.infer<T>>, "resolver">) =>
  useFormReactHookForm<z.infer<T>, TContext, TTransformedValues>({
    resolver: zodResolver(schema),
    defaultValues,
    context,
    criteriaMode,
    delayError,
    disabled,
    errors,
    mode: mode ? mode : "onSubmit",
    progressive,
    resetOptions,
    reValidateMode: reValidateMode ?? "onChange",
    shouldFocusError,
    shouldUnregister,
    shouldUseNativeValidation,
    values,
  });

export default useFormWithZod;
