/* eslint-disable @typescript-eslint/no-explicit-any */
const isExtractableFile = (value: any) => {
  return (
    (typeof File !== "undefined" && value instanceof File) ||
    (typeof Blob !== "undefined" && value instanceof Blob)
  );
};

export default isExtractableFile;
