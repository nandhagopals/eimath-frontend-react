const numberGenerator = (
  isCurrentYear: boolean,
  length: number,
  listOrder: "ASC" | "DESC",
  startYear?: number
): number[] => {
  let yearList: number[] = [];

  if (length > 0) {
    if (isCurrentYear) {
      const currentYear = new Date().getFullYear();

      yearList =
        Array.from({ length: length }, (_, index) => {
          return listOrder === "ASC"
            ? currentYear + index
            : currentYear - index;
        }) || [];
    } else if (startYear && startYear > 0) {
      yearList =
        Array.from({ length: length }, (_, index) => {
          return listOrder === "ASC" ? startYear + index : startYear - index;
        }) || [];
    } else yearList;
  } else yearList;

  return yearList;
};

export { numberGenerator };
