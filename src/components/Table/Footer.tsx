import { FieldValues, Path, useWatch } from "react-hook-form";
import { useState } from "react";

import { TableFooter, FooterRowPerPage } from "components/Table";

import { combineClassName } from "global/helpers";
import ChevronRightIcon from "global/assets/images/chevron-right-filled.svg?react";
import ChevronLeftIcon from "global/assets/images/chevron-left-filled.svg?react";
import { usePagination } from "global/hook";

type Props<TFieldValues extends FieldValues = FieldValues> =
  TableFooter<TFieldValues> & { totalCount: number; loading: boolean };

const Footer = <TFieldValues extends FieldValues = FieldValues>({
  onNext,
  onPageSizeChange,
  onPrev,
  className,
  nextDisabled,
  prevDisabled,
  totalCount = 0,
  control,
  loading,
  noOfItem,
  isNonCursorPage = false,
}: Props<TFieldValues>) => {
  const pageSize = useWatch({
    control,
    name: "pageSize" as unknown as Path<TFieldValues>,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount: 1,
    pageSize,
  });

  let lastPage = paginationRange?.[paginationRange?.length - 1] ?? 0;

  let pageStartRange = pageSize * (currentPage - 1) + 1;

  let pageEndRange =
    currentPage === 1
      ? noOfItem || pageSize * currentPage
      : currentPage === lastPage
      ? totalCount
      : pageSize * currentPage;

  const prevBtnDisabled = isNonCursorPage
    ? currentPage === 1 || loading
    : !prevDisabled || loading;

  const nextBtnDisabled = isNonCursorPage
    ? currentPage === lastPage || loading
    : !nextDisabled || loading;

  return (
    <div
      className={combineClassName(
        "flex justify-end items-center gap-[26px] border-t bg-primary-contrast rounded-b-lg",
        className
      )}
    >
      <FooterRowPerPage
        onPageSizeChange={onPageSizeChange}
        disabled={totalCount <= 0 || loading}
        control={control}
        setCurrentPage={setCurrentPage}
      />

      <p className="text-primary-text flex text-xs font-normal gap-1">
        <span>
          <span>
            {loading ? 0 : totalCount === 0 ? 0 : pageStartRange ?? 0}
          </span>
          <span>-</span>
          <span>{loading ? 0 : totalCount === 0 ? 0 : pageEndRange ?? 0}</span>
        </span>
        <span>of</span>
        <span>{loading ? 0 : totalCount ?? 0}</span>
      </p>

      <div className="flex">
        <ChevronLeftIcon
          className={combineClassName(
            "min-w-12 min-h-12 max-h-12 max-w-12 p-3 rounded-full",
            prevBtnDisabled
              ? "text-action-disabled cursor-default"
              : "text-action-active cursor-pointer hover:bg-action-hover"
          )}
          onClick={() => {
            if (isNonCursorPage) {
              if (!prevBtnDisabled) {
                setCurrentPage((oldPagination) => oldPagination - 1);
                onPrev(currentPage - 1);
              }
            } else {
              if (prevDisabled && !loading) {
                setCurrentPage((oldPagination) => oldPagination - 1);
                onPrev(currentPage - 1);
              }
            }
          }}
        />
        <ChevronRightIcon
          className={combineClassName(
            "min-w-12 min-h-12 max-h-12 max-w-12 p-3 rounded-full",
            nextBtnDisabled
              ? "text-action-disabled cursor-default"
              : "text-action-active cursor-pointer hover:bg-action-hover"
          )}
          onClick={() => {
            if (isNonCursorPage) {
              if (!nextBtnDisabled) {
                setCurrentPage((oldPagination) => oldPagination + 1);
                onNext(currentPage + 1);
              }
            } else {
              if (nextDisabled && !loading) {
                setCurrentPage((oldPagination) => oldPagination + 1);
                onNext(currentPage + 1);
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export { Footer };
