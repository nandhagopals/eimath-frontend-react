import {
  Field,
  FieldErrors,
  FieldValues,
  ResolverOptions,
  get,
  set,
} from "react-hook-form";

import { validateFieldsNatively } from "global/helpers/zod-hook-resolver/helpers";

export const toNestError = <TFieldValues extends FieldValues>(
  errors: FieldErrors,
  options: ResolverOptions<TFieldValues>
): FieldErrors<TFieldValues> => {
  options.shouldUseNativeValidation && validateFieldsNatively(errors, options);

  const fieldErrors = {} as FieldErrors<TFieldValues>;
  for (const path in errors) {
    const field = get(options.fields, path) as Field["_f"] | undefined;

    set(
      fieldErrors,
      path,
      Object.assign(errors[path] || {}, { ref: field && field.ref })
    );
  }

  return fieldErrors;
};
