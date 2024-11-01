const notEmpty = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined && value !== "";
};

const removeDuplicatesByKey = <
  T extends { id: number | string },
  K extends keyof T
>(
  inputArray: T[],
  key: K
): T[] => {
  const arr = new Set();

  const array =
    inputArray?.filter((value: { id: number | string }) => value) || [];

  return array?.filter((item) => {
    const keyValue = item[key];
    return arr.has(keyValue) ? false : arr?.add(keyValue);
  });
};

const removeDuplicates = <T extends string | number | boolean | null>(
  inputArray: T[]
) => inputArray?.filter((item, index) => inputArray?.indexOf(item) === index);

export { notEmpty, removeDuplicatesByKey, removeDuplicates };
