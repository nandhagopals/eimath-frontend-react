/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from "react";
import {
  Column,
  Table as _Table,
  TableHeader,
  TableBody,
  Collection,
  Row,
  Cell,
  Checkbox,
} from "react-aria-components";
import { Controller, FieldValues, Path } from "react-hook-form";

import { type TableProps, Footer } from "components/Table";
import { CustomCheckbox } from "components/Form";

import { combineClassName } from "global/helpers";
import ArrowDownwardIcon from "global/assets/images/arrow-downward-filled.svg?react";
import ArrowUpwardIcon from "global/assets/images/arrow-upward-filled.svg?react";

const Table = <
  Item extends Record<string, any>,
  TFieldValues extends FieldValues = FieldValues
>({
  children,
  items,
  name,
  onRowAction,
  className,
  footer,
  totalCount,
  loading,
  parentClassName,
  control,
  ...props
}: TableProps<Item, TFieldValues>) => {
  // const navigate = useNavigate();

  const table = () => (
    <Controller
      control={control}
      name={"sortBy" as unknown as Path<TFieldValues>}
      render={({ field: { value, onChange } }) => {
        return (
          <_Table
            {...props}
            aria-label={name}
            onSortChange={(descriptor) => {
              onChange(descriptor);
            }}
            sortDescriptor={value ?? undefined}
            onRowAction={(key) => {
              if (onRowAction) {
                const item =
                  (items?.filter((item) => item?.id === key) &&
                    items?.filter((item) => item?.id === key)?.length > 0 &&
                    items?.filter((item) => item?.id === key)[0]) ||
                  null;
                onRowAction(item);
              }
            }}
            className={combineClassName(
              "w-full outline-none bg-primary-contrast rounded",
              !footer ? className : ""
            )}
          >
            {children}
          </_Table>
        );
      }}
    />
  );
  return footer ? (
    <div className={combineClassName("w-full border rounded", parentClassName)}>
      <div
        className={combineClassName(
          "overflow-x-auto overflow-y-clip",
          className
        )}
      >
        {table()}
      </div>
      {footer ? (
        <Footer
          {...footer}
          totalCount={totalCount}
          loading={loading ?? false}
        />
      ) : null}
    </div>
  ) : (
    table()
  );
};

const Head = <
  Head extends {
    id: string;
    name: string;
    isRowHeader?: boolean;
    hideSort?: boolean;
    showCheckbox?: boolean;
  }
>({
  headers,
  allowsSorting,
  className,
  headerClassName,
}: {
  headers: Head[];
  className?: string;
  allowsSorting?: boolean;
  headerClassName?: string;
}) => {
  return (
    <TableHeader
      className={combineClassName(
        "bg-primary-contrast border-b border-outline-border/10 rounded-t-lg",
        className
      )}
    >
      <Collection items={headers}>
        {(item) => (
          <Column
            id={item?.id}
            allowsSorting={item?.hideSort ? undefined : allowsSorting}
            className={combineClassName(
              "p-4 pr-0 w-32 text-start text-primary-text/85 font-medium text-sm leading-6 rounded-t-lg tracking-[.17px] focus:outline-none",
              headerClassName
            )}
            isRowHeader={item?.isRowHeader}
          >
            {({ sortDirection }) => {
              return (
                <div className="flex gap-1 items-center">
                  {item?.showCheckbox && (
                    <Checkbox slot={"selection"}>
                      {({
                        isIndeterminate,
                        isSelected,
                        isDisabled,
                        isReadOnly,
                      }) => {
                        return (
                          <CustomCheckbox
                            isChecked={isSelected}
                            isIndeterminate={isIndeterminate}
                            disabled={isDisabled}
                            readOnly={isReadOnly}
                          />
                        );
                      }}
                    </Checkbox>
                  )}
                  <p>{item?.name}</p>
                  {item?.hideSort ? (
                    <span className="block size-[18px] invisible" />
                  ) : sortDirection === "ascending" ? (
                    <ArrowDownwardIcon
                      className={combineClassName(
                        "text-action-active size-[18px]"
                      )}
                    />
                  ) : sortDirection === "descending" ? (
                    <ArrowUpwardIcon
                      className={combineClassName(
                        "text-action-active size-[18px]"
                      )}
                    />
                  ) : (
                    <span className="block size-[18px] invisible" />
                  )}
                </div>
              );
            }}
          </Column>
        )}
      </Collection>
    </TableHeader>
  );
};

const Body = <
  Item extends Record<string, any>,
  Head extends { id: string; name: string; isRowHeader?: boolean }
>({
  items,
  headers,
  children,
  className,
  loading,
  defaultPageSize,
}: {
  items: Item[];
  headers: Head[];
  children?: ReactNode | ((item: Item) => JSX.Element);
  className?: string;
  loading?: boolean;
  defaultPageSize?: number;
}) => {
  return children ? (
    <TableBody
      items={loading ? [] : items}
      className={className}
      renderEmptyState={() =>
        loading ? (
          <div className="grid grid-cols-1 space-y-0.5 p-1">
            {Array.from({ length: defaultPageSize || 10 })?.map((_, i) => {
              return (
                <div
                  key={i}
                  className="animate-pulse w-full min-h-[50px] bg-slate-200 rounded"
                />
              );
            })}
          </div>
        ) : (
          <div className="w-full min-h-[266px] grid place-items-center text-primary-text/40">
            No records found...
          </div>
        )
      }
    >
      {(item) => (typeof children === "function" ? children(item) : children)}
    </TableBody>
  ) : (
    <TableBody
      items={loading ? [] : items}
      className={className}
      renderEmptyState={() =>
        loading ? (
          <div className="grid grid-cols-1 space-y-0.5 p-1">
            {Array.from({ length: defaultPageSize || 10 })?.map((_, i) => {
              return (
                <div
                  key={i}
                  className="animate-pulse w-full min-h-[50px] bg-action-hover rounded"
                />
              );
            })}
          </div>
        ) : (
          <div className="w-full min-h-[266px] grid place-items-center text-primary-text/40">
            No records found...
          </div>
        )
      }
    >
      {(item) => (
        <Row
          key={item?.id}
          columns={headers}
          className={
            "focus:outline-none hover:bg-action-hover border-y border-outline-border/10"
          }
        >
          {(column) => {
            return (
              <Cell className={"p-4 font-normal text-sm"}>
                {item?.[column?.id]}
              </Cell>
            );
          }}
        </Row>
      )}
    </TableBody>
  );
};

export { Table, Head, Body };
