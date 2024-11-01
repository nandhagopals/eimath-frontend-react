import { SelectionMode } from "react-aria-components";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { ReactHookFormOnChangeEvent } from "../types";

interface ITag {
  id: string | number;
  name: string;
  disabled?: boolean;
}

interface TagGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  Tag extends ITag = ITag
> {
  tags: Tag[];
  selectionMode?: SelectionMode;
  control: Control<TFieldValues>;
  name: Name;
  variant?: "filled" | "outline";
  loading?: boolean;
  className?: string;
  label?: string;
  readOnly?: boolean;
  disabled?: boolean;
  onChange?: ReactHookFormOnChangeEvent<TFieldValues, Name>;
}

export type { TagGroupProps, ITag };
