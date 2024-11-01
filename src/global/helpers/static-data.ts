const rowsPerPageArray = [5, 10, 25, 50, 75, 100, 200, 300, 500];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const genderList = [
  { id: "Male", name: "Male" },
  { id: "Female", name: "Female" },
  { id: "Others", name: "Others" },
];

const commonMimeTypes = ["image/png", "image/gif", "image/jpeg", "image/jpg"];

const imageMimeTypes = [
  ...commonMimeTypes,
  "image/svg+xml",
  "image/webp",
  "image/bmp",
  "image/x-icon",
];

const defaultMimeTypes = ["application/pdf", ...commonMimeTypes];

export {
  rowsPerPageArray,
  months,
  genderList,
  imageMimeTypes,
  defaultMimeTypes,
};
