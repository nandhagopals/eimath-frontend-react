/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldError, FieldErrors, appendErrors } from "react-hook-form";
import { ZodError, z } from "zod";

import {
  type Resolver,
  validateFieldsNatively,
  toNestError,
} from "global/helpers/zod-hook-resolver";

const isZodError = (error: any): error is ZodError => error.errors != null;

const parseErrorSchema = (
  zodErrors: z.ZodIssue[],
  validateAllFieldCriteria: boolean
) => {
  const errors: Record<string, FieldError> = {};
  while (zodErrors.length) {
    const error = zodErrors[0];
    const { code, message, path } = error;
    const _path = path.join(".");

    if (!errors[_path]) {
      if ("unionErrors" in error) {
        const unionError = error.unionErrors[0].errors[0];

        errors[_path] = {
          message: unionError.message,
          type: unionError.code,
        };
      } else {
        errors[_path] = { message, type: code };
      }
    }

    if ("unionErrors" in error) {
      error.unionErrors.forEach((unionError) =>
        unionError.errors.forEach((e) => zodErrors.push(e))
      );
    }

    if (validateAllFieldCriteria) {
      const types = errors[_path].types;
      const messages = types?.[error.code];

      errors[_path] = appendErrors(
        _path,
        validateAllFieldCriteria,
        errors,
        code,
        messages
          ? ([] as string[]).concat(messages as string[], error.message)
          : error.message
      ) as FieldError;
    }

    zodErrors.shift();
  }

  return errors;
};

export const zodResolver: Resolver =
  (schema, schemaOptions, resolverOptions = {}) =>
  async (values, _, options) => {
    try {
      const data = await schema[
        resolverOptions.mode === "sync" ? "parse" : "parseAsync"
      ](values, schemaOptions);

      options.shouldUseNativeValidation && validateFieldsNatively({}, options);

      return {
        errors: {} as FieldErrors,
        values: resolverOptions.raw ? values : data,
      };
    } catch (error: any) {
      if (isZodError(error)) {
        return {
          values: {},
          errors: toNestError(
            parseErrorSchema(
              error.errors,
              !options.shouldUseNativeValidation &&
                options.criteriaMode === "all"
            ),
            options
          ),
        };
      }

      throw error;
    }
  };
