/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from "react";
import { Cell, Row } from "react-aria-components";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { z } from "zod";
import { useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";

import { Body, Head, Table, TableAction } from "components/Table";
import { Button } from "components/Buttons";
import { ConfirmModal } from "components/Modal";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { DateField, InputField } from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { useAllowedResource, useFormWithZod, usePreLoading } from "global/hook";
import {
  combineClassName,
  dateFieldSchema,
  fileDownload,
  formatDate,
  messageHelper,
  somethingWentWrongMessage,
} from "global/helpers";
import AddIcon from "global/assets/images/add-filled.svg?react";
import DownloadIcon from "global/assets/images/file-download-filled.svg?react";

import {
  paymentVoucherSortBySchema,
  PaymentVoucherFieldArgs,
  FilterPaymentVouchersArgs,
  FILTER_PAYMENT_VOUCHERS,
  DELETE_PAYMENT_VOUCHER,
  GENERATE_PAYMENT_VOUCHER_CSV,
  ShowPDF,
  PDFShowing,
} from "modules/PaymentVouchers";

const queryFieldArgs: PaymentVoucherFieldArgs = {
  isAmountNeed: true,
  isDateNeed: true,
  isPayeeNeed: true,
};

const commonTableHeaders = [
  { name: "ID", id: "id", isRowHeader: true },
  { name: "Payee", id: "payee" },
  { name: "Date & Time", id: "dateAndTime" },
  { name: "Amount", id: "amount" },
];

const PaymentVouchers = () => {
  const { canCreate, canDelete } = useAllowedResource("PaymentVoucher", true);
  const canDownloadCSV = useAllowedResource("DownloadPaymentVoucher");
  const canDownloadPDF = useAllowedResource("GeneratePaymentVoucherPdf");
  const navigate = useNavigate();
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const tableHeaders =
    canDelete || canDownloadPDF
      ? [
          ...commonTableHeaders,
          { name: "Actions", id: "action", hideSort: true },
        ]
      : commonTableHeaders;

  const { control, resetField } = useFormWithZod({
    schema: z.object({
      search: z.string().nullable(),
      pageSize: z.number(),
      date: z
        .object({
          start: dateFieldSchema.nullish(),
          end: dateFieldSchema.nullish(),
        })
        .nullish(),
      sortBy: paymentVoucherSortBySchema,
    }),
    defaultValues: {
      pageSize: defaultPageSize,
      date: null,
      sortBy: { column: "id", direction: "descending" },
    },
  });

  const [watchSearch, watchPageSize, watchDate, watchSortBy] = useWatch({
    control,
    name: ["search", "pageSize", "date", "sortBy"],
  });

  const commonQueryArgs: FilterPaymentVouchersArgs = useMemo(
    () => ({
      ...queryFieldArgs,
      pagination: { size: watchPageSize },
      filter: {
        date: watchDate
          ? {
              between: {
                from: `${watchDate?.start?.year}-${watchDate?.start?.month}-${watchDate?.start?.day}`,
                to: `${watchDate?.end?.year}-${watchDate?.end?.month}-${watchDate?.end?.day}`,
              },
            }
          : undefined,
        status: {
          isExactly: "Confirmed",
        },
      },
      globalSearch: undefined,
      sortBy: watchSortBy?.column
        ? {
            column:
              watchSortBy?.column === "dateAndTime"
                ? "date"
                : watchSortBy?.column ?? "id",
            order:
              watchSortBy?.direction === "ascending"
                ? ("ASC" as const)
                : ("DESC" as const),
          }
        : undefined,
    }),
    [
      watchSortBy?.column,
      watchSortBy?.direction,
      watchDate?.start?.year,
      watchDate?.start?.month,
      watchDate?.start?.day,
    ]
  );

  const { data, loading, fetchMore, updateQuery } = useQuery(
    FILTER_PAYMENT_VOUCHERS,
    {
      variables: commonQueryArgs,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
    }
  );

  const [deleteMutation, { loading: updateLoading }] = useMutation(
    DELETE_PAYMENT_VOUCHER
  );

  const [generateCSV, { loading: csvFileLoading }] = useMutation(
    GENERATE_PAYMENT_VOUCHER_CSV
  );

  const [pdfModal, setPDFModal] = useState<ShowPDF>({
    showPDF: false,
    paymentVoucherId: null,
  });

  const [confirmModal, setConfirmModal] = useState<{
    type: "Delete";
    id: number;
  } | null>(null);

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  const confirmHandler = () => {
    if (confirmModal?.id) {
      if (confirmModal?.type === "Delete") {
        deleteMutation({
          variables: {
            id: confirmModal?.id,
          },
        })
          .then((res) => {
            if (res?.data?.deletePaymentVoucher) {
              closeConfirmModal();

              if (data?.filterPaymentVouchers?.edges?.length === 1) {
                resetField("search", {
                  defaultValue: "",
                });
                resetField("pageSize", {
                  defaultValue: defaultPageSize,
                });

                const queryArgs = commonQueryArgs;

                queryArgs.globalSearch = undefined;

                fetchMore({
                  variables: queryArgs,
                  updateQuery: (
                    _,
                    { fetchMoreResult: { filterPaymentVouchers } }
                  ) => {
                    return {
                      filterPaymentVouchers,
                    };
                  },
                }).catch((error) => {
                  toastNotification(messageHelper(error));
                });
              } else if (data?.filterPaymentVouchers?.pageInfo?.hasNextPage) {
                const deleteItemIndex =
                  data?.filterPaymentVouchers?.edges?.findIndex(
                    (edgeDetails) => edgeDetails?.node?.id === +confirmModal?.id
                  );

                const nextPointCursorData =
                  (deleteItemIndex || 0) + 1 === watchPageSize
                    ? data &&
                      data?.filterPaymentVouchers &&
                      data.filterPaymentVouchers?.edges &&
                      data.filterPaymentVouchers?.edges[
                        (deleteItemIndex || 0) - 1
                      ]
                    : null;

                const queryArgs = commonQueryArgs;

                queryArgs.pagination = {
                  size: 1,
                  after:
                    nextPointCursorData?.cursor ||
                    data?.filterPaymentVouchers?.pageInfo?.endCursor,
                };

                fetchMore({
                  variables: queryArgs,
                }).then((refetchRes) => {
                  if (
                    refetchRes?.data?.filterPaymentVouchers?.edges?.length === 1
                  ) {
                    updateQuery(({ filterPaymentVouchers }) => {
                      const olderRecord =
                        filterPaymentVouchers?.edges?.filter(
                          (edgeDetails) =>
                            edgeDetails?.node?.id !== confirmModal?.id
                        ) || [];
                      return {
                        filterPaymentVouchers: filterPaymentVouchers
                          ? {
                              pageInfo: refetchRes?.data?.filterPaymentVouchers
                                ?.pageInfo
                                ? {
                                    ...filterPaymentVouchers?.pageInfo,
                                    endCursor:
                                      refetchRes?.data?.filterPaymentVouchers
                                        ?.pageInfo?.endCursor,
                                    hasNextPage:
                                      refetchRes?.data?.filterPaymentVouchers
                                        ?.pageInfo?.hasNextPage,
                                    totalNumberOfItems:
                                      refetchRes?.data?.filterPaymentVouchers
                                        ?.pageInfo?.totalNumberOfItems,
                                  }
                                : null,
                              edges:
                                refetchRes?.data?.filterPaymentVouchers
                                  ?.edges &&
                                refetchRes?.data?.filterPaymentVouchers?.edges
                                  ?.length > 0
                                  ? [
                                      ...olderRecord,
                                      ...(refetchRes?.data
                                        ?.filterPaymentVouchers?.edges || []),
                                    ]
                                  : [],
                              __typename: filterPaymentVouchers?.__typename,
                            }
                          : null,
                      };
                    });
                  }
                });
              } else {
                updateQuery(({ filterPaymentVouchers }) => {
                  return {
                    filterPaymentVouchers: filterPaymentVouchers
                      ? {
                          pageInfo: filterPaymentVouchers?.pageInfo
                            ? {
                                ...filterPaymentVouchers?.pageInfo,
                                totalNumberOfItems: filterPaymentVouchers
                                  ?.pageInfo?.totalNumberOfItems
                                  ? filterPaymentVouchers?.pageInfo
                                      ?.totalNumberOfItems - 1
                                  : 0,
                              }
                            : null,
                          edges:
                            filterPaymentVouchers?.edges &&
                            filterPaymentVouchers?.edges?.length > 0
                              ? filterPaymentVouchers?.edges?.filter(
                                  (edge) => edge?.node?.id !== confirmModal?.id
                                ) || []
                              : [],
                          __typename: filterPaymentVouchers?.__typename,
                        }
                      : null,
                  };
                });
              }
            }
          })
          .catch((error) => {
            toastNotification(messageHelper(error));
          });
      }
    }
  };

  const rows =
    data?.filterPaymentVouchers?.edges?.map((edge) => ({
      id: edge?.node?.id,
      payee: edge?.node?.payee,
      dateAndTime: formatDate(edge?.node?.date, "dd/MM/yyyy hh:mm a"),
      amount:
        edge?.node?.amount && Number.isInteger(edge?.node?.amount)
          ? edge?.node?.amount
          : edge?.node?.amount && edge?.node?.amount?.toFixed(2),
      action: "action" as const,
    })) || [];

  const onNext = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.globalSearch = watchSearch || undefined;

    queryArgs.pagination = {
      size: watchPageSize,
      after: data?.filterPaymentVouchers?.pageInfo?.endCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterPaymentVouchers } }) => {
        return { filterPaymentVouchers };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPrev = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.globalSearch = watchSearch || undefined;

    queryArgs.pagination = {
      size: watchPageSize,
      before: data?.filterPaymentVouchers?.pageInfo?.startCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterPaymentVouchers } }) => {
        return { filterPaymentVouchers };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPageSizeChange: (page: number) => void = (page) => {
    const queryArgs = commonQueryArgs;

    queryArgs.globalSearch = watchSearch || undefined;

    queryArgs.pagination = {
      size: page,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterPaymentVouchers } }) => {
        return {
          filterPaymentVouchers,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount =
    data?.filterPaymentVouchers?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterPaymentVouchers?.pageInfo?.hasNextPage &&
    data?.filterPaymentVouchers?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterPaymentVouchers?.pageInfo?.hasPreviousPage &&
    data?.filterPaymentVouchers?.pageInfo?.startCursor
      ? true
      : false;

  const preLoading = usePreLoading(loading);

  const onSearchChange: (search: string | null | undefined) => void =
    useCallback((search) => {
      const queryArgs = commonQueryArgs;

      queryArgs.globalSearch = search || undefined;

      fetchMore({
        variables: queryArgs,
        updateQuery: (_, { fetchMoreResult: { filterPaymentVouchers } }) => {
          return {
            filterPaymentVouchers,
          };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }, []);

  const kebabMenuList =
    canDelete && canDownloadPDF
      ? [{ id: "View" }, { id: "Download PDF" }, { id: "Delete" }]
      : canDelete
      ? [{ id: "Delete" }]
      : [{ id: "View" }, { id: "Download PDF" }];

  const kebabMenuAction = (value, item) => {
    if (item?.id) {
      switch (value?.id) {
        case "View": {
          if (item?.id) {
            setPDFModal({
              showPDF: true,
              isViewing: true,
              paymentVoucherId: item?.id,
            });
          }

          break;
        }

        case "Download PDF": {
          setPDFModal({
            showPDF: true,
            paymentVoucherId: item?.id,
          });
          break;
        }

        case "Delete": {
          item?.id &&
            setConfirmModal({
              type: "Delete",
              id: item?.id,
            });
          break;
        }

        default: {
          break;
        }
      }
    }
  };

  const generateCSVHandler = () => {
    generateCSV()
      .then((response) => {
        if (
          response?.data?.generatePaymentVoucherCSV !== null &&
          response?.data?.generatePaymentVoucherCSV !== undefined &&
          response?.data?.generatePaymentVoucherCSV?.length > 5
        ) {
          fileDownload(response?.data?.generatePaymentVoucherCSV);
        } else {
          toastNotification(somethingWentWrongMessage);
        }
      })
      .catch((error) => {
        toastNotification(messageHelper(error));
      });
  };

  return (
    <div className="space-y-6 w-full sm:max-w-6xl">
      <div className="flex justify-between gap-2 py-2">
        <TitleAndBreadcrumb
          title="Payment Vouchers"
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Payment Vouchers",
              to: "/payment-vouchers",
            },
          ]}
        />
        {canCreate && (
          <Button
            onPress={() => {
              navigate({
                to: "/payment-vouchers/$paymentVoucherId",
                params: {
                  paymentVoucherId: "new",
                },
              });
            }}
            className={
              "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px]"
            }
          >
            <AddIcon />
            ADD PAYMENT VOUCHER
          </Button>
        )}
      </div>

      <div className="flex flex-wrap justify-center items-center gap-4 w-full">
        <div className="flex justify-center items-center md:justify-start flex-wrap gap-3 flex-1">
          <InputField
            control={control}
            name="search"
            type="search"
            debounceOnChange={onSearchChange}
            variant="small"
            className="min-w-[220px] max-w-[220px]"
          />
          <DateField
            control={control}
            name="date"
            label="Date"
            type="date-range"
            className="min-w-[330px] max-w-[330px]"
            classNameForDateRangePicker="min-h-[38px]"
          />
        </div>

        {canDownloadCSV && totalCount > 0 && (
          <Button
            variant="outlined"
            onPress={generateCSVHandler}
            className={
              "min-w-[220px] md:min-w-min w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px] shadow-none"
            }
            loading={csvFileLoading}
            loadingColor="secondary"
          >
            <DownloadIcon />
            DOWNLOAD CSV
          </Button>
        )}
      </div>
      <Table
        name="Payment Voucher"
        footer={{
          onNext,
          onPageSizeChange,
          onPrev,
          nextDisabled,
          prevDisabled,
          control,
          noOfItem: rows?.length ?? 0,
        }}
        totalCount={totalCount}
        loading={preLoading}
        className={"font-roboto rounded"}
        control={control}
      >
        <Head headers={tableHeaders} allowsSorting />
        <Body
          headers={tableHeaders}
          items={rows}
          defaultPageSize={defaultPageSize}
          loading={!!preLoading}
          className={
            "text-[14px] leading-5 tracking-[.17px] divide-y divide-gray-200"
          }
        >
          {(item) => (
            <Row
              columns={tableHeaders}
              className={"hover:bg-action-hover focus:outline-none "}
            >
              {(column) => (
                <Cell
                  className={combineClassName(
                    "px-4 last:px-0",
                    item[column?.id] === "action" ? "" : "py-[15px]"
                  )}
                >
                  {item[column?.id] ? (
                    item[column?.id] === "action" ? (
                      <TableAction
                        type="kebab"
                        items={kebabMenuList}
                        onAction={(value) => {
                          kebabMenuAction(value, item);
                        }}
                      />
                    ) : (
                      item[column?.id]
                    )
                  ) : (
                    "N/A"
                  )}
                </Cell>
              )}
            </Row>
          )}
        </Body>
      </Table>

      {confirmModal?.id && (
        <ConfirmModal
          message={`Confirm ${
            confirmModal?.type === "Delete" ? "Delete" : "Action"
          }?`}
          onClose={closeConfirmModal}
          button={{
            primary: {
              loading: updateLoading,
              onPress: confirmHandler,
            },
            secondary: {
              isDisabled: updateLoading,
            },
          }}
          isOpen={!!confirmModal?.id}
          loading={updateLoading}
        />
      )}
      <PDFShowing
        isOpen={pdfModal?.showPDF}
        setPDFModal={setPDFModal}
        pdfModal={pdfModal}
        modalFrom="List"
      />
    </div>
  );
};

export default PaymentVouchers;
