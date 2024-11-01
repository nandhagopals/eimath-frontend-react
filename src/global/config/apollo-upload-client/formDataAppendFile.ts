const formDataAppendFile = (
  formData: FormData,
  fieldName: string,
  file: File
) => {
  "name" in file
    ? formData.append(fieldName, file, file?.name)
    : formData.append(fieldName, file);
};
export default formDataAppendFile;
