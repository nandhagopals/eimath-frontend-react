/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Body } from "@apollo/client/link/http/selectHttpOptionsAndBody";

const isPlainObject = (value: any) => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return (
    (prototype === null ||
      prototype === Object.prototype ||
      Object.getPrototypeOf(prototype) === null) &&
    !(Symbol.toStringTag in value) &&
    !(Symbol.iterator in value)
  );
};

const extractFiles = (
  value: Body,
  isExtractable: (value: Body) => boolean,
  path = ""
) => {
  const clones = new Map();

  const files = new Map();

  const recurse = (value: Body, path: string, recursed: Set<unknown>) => {
    if (isExtractable(value)) {
      const filePaths = files.get(value);

      filePaths ? filePaths.push(path) : files.set(value, [path]);

      return null;
    }

    const valueIsList =
      Array.isArray(value) ||
      (typeof FileList !== "undefined" && value instanceof FileList);

    const valueIsPlainObject = isPlainObject(value);

    if (valueIsList || valueIsPlainObject) {
      let clone = clones.get(value);

      const unCloned = !clone;

      if (unCloned) {
        clone = valueIsList
          ? []
          : value instanceof Object
          ? {}
          : Object.create(null);

        clones.set(value, clone);
      }

      if (!recursed.has(value)) {
        const pathPrefix = path ? `${path}.` : "";
        const recursedDeeper = new Set(recursed).add(value);

        if (valueIsList) {
          let index = 0;

          for (const item of value) {
            const itemClone = recurse(
              item,
              pathPrefix + index++,
              recursedDeeper
            );

            if (unCloned) clone.push(itemClone);
          }
        } else
          for (const key in value) {
            const propertyClone = recurse(
              (value as unknown as any)[key],
              pathPrefix + key,
              recursedDeeper
            );

            if (unCloned) clone[key] = propertyClone;
          }
      }

      return clone;
    }

    return value;
  };

  return {
    clone: recurse(value, path, new Set()),
    files,
  };
};

export default extractFiles;
