import { TableProps as ReactAriaTableProps } from "react-aria-components";
import { Control, FieldValues } from "react-hook-form";

type TableProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Item extends Record<string, any>,
  TFieldValues extends FieldValues = FieldValues
> = Omit<ReactAriaTableProps, "onRowAction"> & {
  name: string;
  items?: Item[];
  onRowAction?: (item: Item | null) => void;
  footer?: TableFooter<TFieldValues>;
  totalCount: number;
  loading?: boolean;
  parentClassName?: string;
  control: Control<TFieldValues>;
};

interface TableFooter<TFieldValues extends FieldValues = FieldValues> {
  onNext: (page: number) => void;
  onPrev: (page: number) => void;
  onPageSizeChange: (page: number) => void;
  className?: string;
  nextDisabled?: boolean;
  prevDisabled?: boolean;
  control: Control<TFieldValues>;
  noOfItem: number;
  isNonCursorPage?: boolean;
}

export type { TableProps, TableFooter };
