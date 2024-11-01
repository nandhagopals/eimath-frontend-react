import { Control, FieldPath, FieldValues } from "react-hook-form";

import { ReactHookFormOnChangeEvent, SupportText } from "components/Form";

type FileUploadProps<
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  label: string;
  name: Name;
  control: Control<TFieldValues>;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: ReactHookFormOnChangeEvent<TFieldValues, Name>;
  className?: string;
  mimeTypes?: string[];
  shouldUnregister?: boolean;
  supportText?: SupportText;
  multiple?: boolean;
  canClear?: boolean;
  classNameForCloseBtn?: string;
};

export type { FileUploadProps };
