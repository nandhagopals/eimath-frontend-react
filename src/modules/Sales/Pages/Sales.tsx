/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Cell, Checkbox, Row, Selection } from "react-aria-components";
import {
  useLazyQuery,
  useMutation,
  useQuery,
  useReactiveVar,
} from "@apollo/client";
import { Controller, useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { RadioGroup as _RadioGroup } from "@headlessui/react";

import { Body, Head, Table, TableAction } from "components/Table";
import { Button } from "components/Buttons";
import { ConfirmModal, Modal } from "components/Modal";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import {
  Combobox,
  CustomCheckbox,
  DateField,
  InputField,
  RadioGroup,
  Select,
} from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { useAllowedResource, useAuth, useFormWithZod } from "global/hook";
import {
  combineClassName,
  dateTimeSubmitFormat,
  fileDownload,
  formatDate,
  messageHelper,
  notEmpty,
  somethingWentWrongMessage,
  updateSuccessMessage,
} from "global/helpers";
import AddIcon from "global/assets/images/add-filled.svg?react";
import DownloadIcon from "global/assets/images/file-download-filled.svg?react";

import {
  GENERATE_RECEIPT_PDF,
  GENERATE_SALE_CSV,
  GET_INVOICE_PAYMENT_METHOD,
  GET_INVOICE_TYPES,
  InvoicePaymentMethod,
  SEND_INVOICE_MAIL,
  salesFilterSchema,
} from "modules/Sales";
import {
  FILTER_INVOICES,
  FilterInvoicesArgs,
  InvoiceFieldArgs,
  InvoiceStatus,
  UPDATE_BULK_INVOICE_PAID,
  UPDATE_INVOICE,
} from "modules/Students";
import SalesItemAccordion from "modules/Sales/Pages/SalesItemAccordion";
import ViewInvoiceOrReceipt from "modules/Sales/Pages/ViewInvoiceOrReceipt";
import { FILTER_MASTER_FRANCHISEE_INFORMATION } from "modules/MasterFranchisee";
import { FILTER_FRANCHISEES } from "modules/Franchisee";
import { Loading } from "components/Loading";

const fieldArgs: InvoiceFieldArgs = {
  isInvoiceTotalNeed: true,
  isInvoiceInvoiceIdNeed: true,
  isInvoiceCreatedAtNeed: true,
  isInvoiceUpdatedAtNeed: true,
  isInvoiceStatusNeed: true,
  // isInvoiceCategoryNeed: true,
  isInvoiceReceiptIdNeed: true,
  isInvoiceStudentNeed: true,
  isInvoiceInvoiceFileURLNeed: true,
  isInvoiceTypeNeed: true,
  isInvoiceCategoryNeed: true,
  isInvoiceOrderingPartyStudentNeed: true,
  isInvoiceOrderingPartyFranchiseeNeed: true,
  isInvoiceOrderingPartyMFNeed: true,
  isInvoiceOrderingPartyNameNeed: true,
};

const Sales = () => {
  const { canCreate, canUpdate } = useAllowedResource("Invoice", true);
  const [tableLoading, setTableLoading] = useState(false);

  const canDownloadCSV = useAllowedResource("DownloadInvoice");

  const navigate = useNavigate();
  const { authUserDetails } = useAuth();
  const isAdmin = authUserDetails?.type === "User";
  const isMasterFranchisee =
    authUserDetails?.type === "MF Owner" ||
    authUserDetails?.type === "MF Staff";
  const isFranchisee = authUserDetails?.type === "Franchisee";

  const [
    fetchMasterFranchiseeInfo,
    { data: masterFranchiseeInfo, loading: masterFranchiseeInfoLoading },
  ] = useLazyQuery(FILTER_MASTER_FRANCHISEE_INFORMATION, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const [
    fetchFranchiseeInfo,
    { data: franchiseeInfo, loading: franchiseeInfoLoading },
  ] = useLazyQuery(FILTER_FRANCHISEES, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { control, resetField, setError, clearErrors } = useFormWithZod({
    schema: salesFilterSchema,
    defaultValues: {
      pageSize: defaultPageSize,
      pageStatus: "INVOICE/RECEIPT",
      search: "",
      cursor: null,
      dateRange: null,
      pageType: null,
      sortBy: { column: "id", direction: "descending" },
      type: null,
      fromHQOrWithFranchisee: isMasterFranchisee ? "FROM HQ" : null,
    },
  });

  const [
    watchSearch,
    watchPageSize,
    watchPageStatus,
    watchSortBy,
    watchPaymentMethod,
    watchDateRange,
    watchFromHQOrWithFranchisee,
    watchInvoiceType,
  ] = useWatch({
    control,
    name: [
      "search",
      "pageSize",
      "pageStatus",
      "sortBy",
      "paymentMethod",
      "dateRange",
      "fromHQOrWithFranchisee",
      "type",
    ],
  });

  const commonTableHeaders = [
    { name: "ID", id: "id" as const, isRowHeader: true },
    { name: "Order Party", id: "orderParty" as const, hideSort: true },
    { name: "Invoice ID", id: "invoiceId" as const },
    {
      name: "Receipt ID",
      id: "receiptId" as const,
    },
    { name: "Last modified date", id: "lastModifiedDate" as const },
    {
      name: `${watchFromHQOrWithFranchisee === "FROM HQ" ? "Points" : "Price"}${
        watchFromHQOrWithFranchisee === "FROM HQ"
          ? ""
          : isAdmin
          ? " (SGD)"
          : isMasterFranchisee &&
            (masterFranchiseeInfo?.filterMasterFranchiseeInformation?.edges?.[0]
              ?.node?.currency?.length || 0) > 0
          ? ` (${masterFranchiseeInfo?.filterMasterFranchiseeInformation?.edges?.[0]?.node?.currency})`
          : isFranchisee &&
            (franchiseeInfo?.filterFranchisees?.edges?.[0]?.node
              ?.masterFranchiseeInformation?.currency?.length || 0) > 0
          ? ` (${franchiseeInfo?.filterFranchisees?.edges?.[0]?.node?.masterFranchiseeInformation?.currency})`
          : ""
      }`,
      id: "price" as const,
      hideSort: true,
    },
    { name: "Type", id: "type" as const },
    { name: "Status", id: "status" as const },
  ];

  const tableHeaders: {
    name: string;
    id:
      | "id"
      | "orderParty"
      | "invoiceId"
      | "price"
      | "receiptId"
      | "price"
      | "type"
      | "action"
      | "lastModifiedDate"
      | "status"
      | "dateOfCreation"
      | "category";
    isRowHeader?: boolean;
    hideSort?: boolean;
    showCheckbox?: boolean;
  }[] = isFranchisee
    ? [
        {
          name: "ID",
          id: "id" as const,
          isRowHeader: true,
          showCheckbox: watchPageStatus !== "CANCELLED",
        },
        { name: "Order Party", id: "orderParty" as const, hideSort: true },
        { name: "Invoice ID", id: "invoiceId" as const },
        {
          name: "Receipt ID",
          id: "receiptId" as const,
        },
        { name: "Last modified date", id: "lastModifiedDate" as const },
        {
          name: `Price${
            isAdmin
              ? " (SGD)"
              : isMasterFranchisee &&
                (masterFranchiseeInfo?.filterMasterFranchiseeInformation
                  ?.edges?.[0]?.node?.currency?.length || 0) > 0
              ? ` (${masterFranchiseeInfo?.filterMasterFranchiseeInformation?.edges?.[0]?.node?.currency})`
              : isFranchisee &&
                (franchiseeInfo?.filterFranchisees?.edges?.[0]?.node
                  ?.masterFranchiseeInformation?.currency?.length || 0) > 0
              ? ` (${franchiseeInfo?.filterFranchisees?.edges?.[0]?.node?.masterFranchiseeInformation?.currency})`
              : ""
          }`,
          id: "price" as const,
          hideSort: true,
        },
        { name: "Category", id: "category" as const },
        { name: "Type", id: "type" as const },
        { name: "Status", id: "status" as const },
        { name: "Actions", id: "action" as const, hideSort: true },
      ]
    : [
        ...commonTableHeaders,
        { name: "Actions", id: "action" as const, hideSort: true },
      ];

  const commonQueryArgs: FilterInvoicesArgs = useMemo(
    () => ({
      ...fieldArgs,
      pagination: { size: watchPageSize },
      filter: {
        status: {
          inArray:
            watchPageStatus === "INVOICE/RECEIPT"
              ? ["Unpaid", "Paid", "Pending"]
              : watchPageStatus === "CANCELLED"
              ? ["Canceled"]
              : [],
        },
        date:
          watchDateRange && watchDateRange?.start && watchDateRange?.end
            ? {
                between: {
                  from: dateTimeSubmitFormat(watchDateRange?.start),
                  to: dateTimeSubmitFormat(watchDateRange?.end),
                },
              }
            : undefined,
        type: watchInvoiceType
          ? {
              isExactly: watchInvoiceType,
            }
          : undefined,
        mfScreen: isMasterFranchisee
          ? watchFromHQOrWithFranchisee === "FROM HQ"
            ? "HQ"
            : "Franchisee"
          : undefined,
      },
      globalSearch: undefined,
      sortBy: watchSortBy?.column
        ? {
            column:
              watchSortBy?.column === "dateOfCreation"
                ? "createdAt"
                : watchSortBy?.column === "lastModifiedDate"
                ? "updatedAt"
                : watchSortBy?.column ?? "id",
            order:
              watchSortBy?.direction === "ascending"
                ? ("ASC" as const)
                : ("DESC" as const),
          }
        : undefined,
    }),
    [
      watchPageStatus,
      watchInvoiceType,
      watchSortBy?.column,
      watchSortBy?.direction,
      watchFromHQOrWithFranchisee,
      watchDateRange?.start,
      watchDateRange?.end,
    ]
  );

  const { data, loading, reobserve } = useQuery(FILTER_INVOICES, {
    variables: commonQueryArgs,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (!loading) {
      setTableLoading(false);
    }
  }, [loading]);

  const { data: invoiceTypesDropDown, loading: invoiceTypesDropDownLoading } =
    useQuery(GET_INVOICE_TYPES, {
      variables: commonQueryArgs,
      notifyOnNetworkStatusChange: true,
    });

  useEffect(() => {
    if (isMasterFranchisee) {
      fetchMasterFranchiseeInfo({
        variables: {
          isMasterFranchiseeInformationCurrencyNeed: true,
        },
      });
    } else if (isFranchisee) {
      fetchFranchiseeInfo({
        variables: {
          isFranchiseeMasterFranchiseeInformationNeed: true,
        },
      });
    }
  }, [isMasterFranchisee, isFranchisee]);

  const [updateMutation, { loading: updateLoading }] =
    useMutation(UPDATE_INVOICE);

  const [updateBulkActionMutation, { loading: updateBulkActionLoading }] =
    useMutation(UPDATE_BULK_INVOICE_PAID);

  const [sendInvoice, { loading: sendInvoiceLoading }] =
    useMutation(SEND_INVOICE_MAIL);

  const [generateCSV, { loading: csvFileLoading }] =
    useMutation(GENERATE_SALE_CSV);

  const [generateReceiptPdf] = useLazyQuery(GENERATE_RECEIPT_PDF);

  const {
    data: getInvoicePaymentMethod,
    loading: getInvoicePaymentMethodLoading,
  } = useQuery(GET_INVOICE_PAYMENT_METHOD);

  const [confirmModal, setConfirmModal] = useState<
    | { type: "Pushed to Receipt"; id: number }
    | { type: "Cancel"; id: number }
    | { type: "Revert Back"; id: number }
    | { type: "Paid"; id: number }
    | { type: "Refund"; id: number }
    | { type: "Delete"; id: number }
    | { type: "Issue invoice"; id: number }
    | { type: "bulkAction"; ids: number[] }
    | null
  >(null);

  const closeConfirmModal = () => {
    setConfirmModal(null);
    setMakePayment(null);
    resetField("paymentMethod", { defaultValue: null });
    clearErrors("paymentMethod");
  };

  const confirmHandler = () => {
    if (
      confirmModal?.type &&
      confirmModal?.type !== "bulkAction" &&
      confirmModal?.id
    ) {
      if (confirmModal?.type === "Issue invoice") {
        sendInvoice({
          variables: {
            invoiceId: confirmModal?.id,
          },
        })
          .then(({ data }) => {
            if (data?.sendInvoiceMail) {
              closeConfirmModal();
              toastNotification([
                {
                  message: data?.sendInvoiceMail,
                  messageType: "success",
                },
              ]);
            } else {
              toastNotification(somethingWentWrongMessage);
            }
          })
          .catch((error) => {
            toastNotification(messageHelper(error));
          });
      } else {
        updateMutation({
          variables: {
            id: confirmModal?.id,
            status:
              confirmModal?.type === "Refund"
                ? "Refund"
                : confirmModal?.type === "Revert Back"
                ? "Unpaid"
                : confirmModal?.type === "Cancel"
                ? "Canceled"
                : confirmModal?.type === "Paid" ||
                  confirmModal?.type === "Pushed to Receipt"
                ? "Paid"
                : confirmModal?.type === "Delete"
                ? "Deleted"
                : "Unpaid",
          },
        })
          .then((res) => {
            if (res?.data?.updateInvoice) {
              closeConfirmModal();

              if (data?.filterInvoices?.edges?.length === 1) {
                resetField("search", {
                  defaultValue: "",
                });
                resetField("pageSize", {
                  defaultValue: defaultPageSize,
                });
                resetField("cursor", {
                  defaultValue: null,
                });
                resetField("pageStatus", { defaultValue: "INVOICE/RECEIPT" });
                resetField("sortBy", { defaultValue: null });

                const queryArgs = commonQueryArgs;

                queryArgs.globalSearch = undefined;

                reobserve({
                  variables: queryArgs,
                  fetchPolicy: "network-only",
                }).catch((error) => {
                  toastNotification(messageHelper(error));
                });

                // fetchMore({
                //   variables: queryArgs,
                //   updateQuery: (_, { fetchMoreResult: { filterInvoices } }) => {
                //     return {
                //       filterInvoices,
                //     };
                //   },
                // }).catch((error) => {
                //   toastNotification(messageHelper(error));
                // });
              } else if (data?.filterInvoices?.pageInfo?.hasNextPage) {
                // const deleteItemIndex = data?.filterInvoices?.edges?.findIndex(
                //   (edgeDetails) => edgeDetails?.node?.id === +confirmModal?.id
                // );

                // const nextPointCursorData =
                //   (deleteItemIndex || 0) + 1 === watchPageSize
                //     ? data &&
                //       data?.filterInvoices &&
                //       data.filterInvoices?.edges &&
                //       data.filterInvoices?.edges[(deleteItemIndex || 0) - 1]
                //     : null;

                const queryArgs = commonQueryArgs;

                queryArgs.globalSearch = undefined;

                // queryArgs.pagination = {
                //   size: 1,
                //   after:
                //     nextPointCursorData?.cursor ||
                //     data?.filterInvoices?.pageInfo?.endCursor,
                // };

                reobserve({
                  variables: queryArgs,
                  fetchPolicy: "network-only",
                }).catch((error) => {
                  toastNotification(messageHelper(error));
                });

                // fetchMore({
                //   variables: queryArgs,
                // }).then((refetchRes) => {
                //   if (refetchRes?.data?.filterInvoices?.edges?.length === 1) {
                //     updateQuery(({ filterInvoices }) => {
                //       const olderRecord =
                //         filterInvoices?.edges?.filter(
                //           (edgeDetails) =>
                //             edgeDetails?.node?.id !== confirmModal?.id
                //         ) || [];
                //       return {
                //         filterInvoices: filterInvoices
                //           ? {
                //               pageInfo: refetchRes?.data?.filterInvoices
                //                 ?.pageInfo
                //                 ? {
                //                     ...filterInvoices?.pageInfo,
                //                     endCursor:
                //                       refetchRes?.data?.filterInvoices?.pageInfo
                //                         ?.endCursor,
                //                     hasNextPage:
                //                       refetchRes?.data?.filterInvoices?.pageInfo
                //                         ?.hasNextPage,
                //                     totalNumberOfItems:
                //                       refetchRes?.data?.filterInvoices?.pageInfo
                //                         ?.totalNumberOfItems,
                //                   }
                //                 : null,
                //               edges:
                //                 refetchRes?.data?.filterInvoices?.edges &&
                //                 refetchRes?.data?.filterInvoices?.edges
                //                   ?.length > 0
                //                   ? [
                //                       ...olderRecord,
                //                       ...(refetchRes?.data?.filterInvoices
                //                         ?.edges || []),
                //                     ]
                //                   : [],
                //               __typename: filterInvoices?.__typename,
                //             }
                //           : null,
                //       };
                //     });
                //   }
                // });
              } else {
                const queryArgs = commonQueryArgs;

                queryArgs.globalSearch = undefined;

                reobserve({
                  variables: queryArgs,
                  fetchPolicy: "network-only",
                }).catch((error) => {
                  toastNotification(messageHelper(error));
                });

                // updateQuery(({ filterInvoices }) => {
                //   return {
                //     filterInvoices: filterInvoices
                //       ? {
                //           pageInfo: filterInvoices?.pageInfo
                //             ? {
                //                 ...filterInvoices?.pageInfo,
                //                 totalNumberOfItems: filterInvoices?.pageInfo
                //                   ?.totalNumberOfItems
                //                   ? filterInvoices?.pageInfo
                //                       ?.totalNumberOfItems - 1
                //                   : 0,
                //               }
                //             : null,
                //           edges:
                //             filterInvoices?.edges &&
                //             filterInvoices?.edges?.length > 0
                //               ? filterInvoices?.edges?.filter(
                //                   (edge) => edge?.node?.id !== confirmModal?.id
                //                 ) || []
                //               : [],
                //           __typename: filterInvoices?.__typename,
                //         }
                //       : null,
                //   };
                // });
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
    data?.filterInvoices?.edges?.map((edge) => ({
      id: edge?.node?.id,
      orderParty:
        edge?.node?.orderingPartyName ??
        edge?.node?.orderingPartyStudent?.name ??
        edge?.node?.orderingPartyFranchisee?.franchiseeName ??
        edge?.node?.orderingPartyMF?.masterFranchiseeName,
      invoiceId: edge?.node?.invoiceId,
      receiptId: edge?.node?.receiptId,
      dateOfCreation: edge?.node?.createdAt,
      lastModifiedDate: edge?.node?.updatedAt,
      price:
        edge?.node?.total && Number.isInteger(edge?.node?.total)
          ? edge?.node?.total
          : edge?.node?.total && edge?.node?.total?.toFixed(2),
      type: edge?.node?.type,
      status: edge?.node?.status,
      invoiceUrl: edge?.node?.invoiceFileURL,
      category: edge?.node?.category,
      action: "action" as const,
    })) || [];

  const onNext = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.globalSearch = watchSearch || undefined;

    queryArgs.pagination = {
      size: watchPageSize,
      after: data?.filterInvoices?.pageInfo?.endCursor,
    };

    reobserve({
      variables: queryArgs,
      fetchPolicy: "network-only",
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });

    // fetchMore({
    //   variables: queryArgs,
    //   updateQuery: (_, { fetchMoreResult: { filterInvoices } }) => {
    //     return { filterInvoices };
    //   },
    // }).catch((error) => {
    //   toastNotification(messageHelper(error));
    // });
  };

  const onPrev = () => {
    const queryArgs = commonQueryArgs;
    queryArgs.globalSearch = watchSearch || undefined;

    queryArgs.pagination = {
      size: watchPageSize,
      before: data?.filterInvoices?.pageInfo?.startCursor,
    };

    reobserve({
      variables: queryArgs,
      fetchPolicy: "network-only",
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });

    // fetchMore({
    //   variables: queryArgs,
    //   updateQuery: (_, { fetchMoreResult: { filterInvoices } }) => {
    //     return { filterInvoices };
    //   },
    // }).catch((error) => {
    //   toastNotification(messageHelper(error));
    // });
  };

  const onPageSizeChange: (page: number) => void = (page) => {
    const queryArgs = commonQueryArgs;
    queryArgs.globalSearch = watchSearch || undefined;
    queryArgs.pagination = {
      size: page,
    };

    reobserve({
      variables: queryArgs,
      fetchPolicy: "network-only",
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });

    // fetchMore({
    //   variables: queryArgs,
    //   updateQuery: (_, { fetchMoreResult: { filterInvoices } }) => {
    //     return {
    //       filterInvoices,
    //     };
    //   },
    // }).catch((error) => {
    //   toastNotification(messageHelper(error));
    // });
  };

  const totalCount = data?.filterInvoices?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterInvoices?.pageInfo?.hasNextPage &&
    data?.filterInvoices?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterInvoices?.pageInfo?.hasPreviousPage &&
    data?.filterInvoices?.pageInfo?.startCursor
      ? true
      : false;

  const preLoading =
    loading || masterFranchiseeInfoLoading || franchiseeInfoLoading;

  const onSearchChange: (search: string | null | undefined) => void =
    useCallback((search) => {
      const queryArgs = commonQueryArgs;

      queryArgs.globalSearch = search || undefined;

      reobserve({
        variables: queryArgs,
        fetchPolicy: "network-only",
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });

      // fetchMore({
      //   variables: queryArgs,
      //   updateQuery: (_, { fetchMoreResult: { filterInvoices } }) => {
      //     return {
      //       filterInvoices,
      //     };
      //   },
      // }).catch((error) => {
      //   toastNotification(messageHelper(error));
      // });
    }, []);

  const paymentMethodOptions =
    getInvoicePaymentMethod?.getInvoicePaymentMethod ?? [];

  const generateCSVHandler = () => {
    generateCSV({
      variables: {
        mfScreen: isMasterFranchisee
          ? watchFromHQOrWithFranchisee === "FROM HQ"
            ? "HQ"
            : "Franchisee"
          : undefined,
      },
    })
      .then(({ data }) => {
        if (
          data?.generateInvoiceCSV !== null &&
          data?.generateInvoiceCSV !== undefined &&
          data?.generateInvoiceCSV?.length > 5
        ) {
          fileDownload(data?.generateInvoiceCSV);
        } else {
          toastNotification(somethingWentWrongMessage);
        }
      })
      .catch((error) => {
        toastNotification(messageHelper(error));
      });
  };

  const kebabMenuList = (
    item: (typeof rows)[number]
  ): {
    id:
      | "View"
      | "Paid"
      | "Cancel"
      | "View Invoice"
      | "View Receipt"
      | "Delete"
      | "Pushed to Receipt"
      | "Revert Back"
      | "Issue Invoice"
      | "Refund"
      | "Make Payment";
  }[] => {
    return watchPageStatus === "INVOICE/RECEIPT"
      ? item?.status === "Pending"
        ? isAdmin || isMasterFranchisee
          ? canUpdate
            ? [{ id: "View" }, { id: "Pushed to Receipt" }, { id: "Cancel" }]
            : [{ id: "View" }]
          : canUpdate
          ? [{ id: "Issue Invoice" }]
          : [{ id: "Issue Invoice" }]
        : item?.status === "Unpaid"
        ? isAdmin || isFranchisee
          ? canUpdate
            ? [{ id: "View" }, { id: "Paid" }, { id: "Cancel" }]
            : [{ id: "View" }]
          : canUpdate
          ? [{ id: "View" }, { id: "Make Payment" }, { id: "Cancel" }]
          : [{ id: "View" }]
        : item?.status === "Paid"
        ? [{ id: "View Invoice" }, { id: "View Receipt" }]
        : [{ id: "View" }]
      : watchPageStatus === "CANCELLED"
      ? isAdmin
        ? canUpdate
          ? [{ id: "View" }, { id: "Revert Back" }]
          : [{ id: "View" }]
        : isMasterFranchisee
        ? canUpdate
          ? [{ id: "View Invoice" }, { id: "Delete" }]
          : [{ id: "View Invoice" }]
        : []
      : [{ id: "View" }];
  };

  const kebabMenuAction = (
    value: {
      id:
        | "View"
        | "Paid"
        | "Cancel"
        | "View Invoice"
        | "View Receipt"
        | "Delete"
        | "Pushed to Receipt"
        | "Revert Back"
        | "Issue Invoice"
        | "Refund"
        | "Make Payment";
    } | null,
    item: (typeof rows)[number]
  ) => {
    if (item?.id) {
      switch (value?.id) {
        case "View": {
          if (item?.status === "Refund") {
            navigate({
              to: "/sales/$saleId",
              params: {
                saleId: item?.id,
              },
              search: {
                pageStatus: watchPageStatus,
              },
            });
          } else if (
            item?.receiptId != null &&
            item?.receiptId != undefined &&
            item?.receiptId?.length > 0
          ) {
            generateReceiptPdf({
              variables: {
                invoiceId: item?.id,
              },
            })
              .then(({ data }) => {
                if (data?.generateReceiptPdf?.filePath) {
                  setShowInvoiceReceiptPDF(data?.generateReceiptPdf?.filePath);
                  setPDFFileDetails({
                    fileType: "RECEIPT",
                    fileTypeId: item?.id || undefined,
                  });
                } else {
                  toastNotification(somethingWentWrongMessage);
                }
              })
              .catch((err) => {
                toastNotification(err);
              });
          } else {
            if (item?.invoiceUrl) {
              setShowInvoiceReceiptPDF(item?.invoiceUrl);
              setPDFFileDetails({
                fileType: "INVOICE",
                fileTypeId: item?.id || undefined,
              });
            } else {
              toastNotification(somethingWentWrongMessage);
            }
          }
          break;
        }
        case "Cancel": {
          setConfirmModal({
            id: item?.id,
            type: "Cancel",
          });
          break;
        }
        case "Pushed to Receipt": {
          setConfirmModal({
            id: item?.id,
            type: "Pushed to Receipt",
          });
          break;
        }
        case "Delete": {
          setConfirmModal({
            id: item?.id,
            type: "Delete",
          });
          break;
        }
        case "Revert Back": {
          setConfirmModal({
            id: item?.id,
            type: "Revert Back",
          });
          break;
        }
        case "View Invoice": {
          if (item?.invoiceUrl) {
            setShowInvoiceReceiptPDF(item?.invoiceUrl);
            setPDFFileDetails({
              fileType: "INVOICE",
              fileTypeId: item?.id || undefined,
            });
          } else {
            toastNotification(somethingWentWrongMessage);
          }
          break;
        }
        case "View Receipt": {
          generateReceiptPdf({
            variables: {
              invoiceId: item?.id,
            },
          })
            .then(({ data }) => {
              if (data?.generateReceiptPdf?.filePath) {
                setShowInvoiceReceiptPDF(data?.generateReceiptPdf?.filePath);
                setPDFFileDetails({
                  fileType: "RECEIPT",
                  fileTypeId: item?.id || undefined,
                });
              } else {
                toastNotification(somethingWentWrongMessage);
              }
            })
            .catch((err) => {
              toastNotification(err);
            });
          break;
        }
        case "Paid": {
          resetField("paymentMethod", {
            defaultValue: null,
          });
          setConfirmModal({
            type: "Paid",
            id: item?.id,
          });
          break;
        }
        case "Refund": {
          setConfirmModal({
            type: "Refund",
            id: item?.id,
          });
          break;
        }
        case "Make Payment": {
          setMakePayment({
            id: item?.id,
          });
          break;
        }
        case "Issue Invoice": {
          setConfirmModal({
            type: "Issue invoice",
            id: item?.id,
          });
          break;
        }
      }
    }
  };

  const [showInvoiceReceiptPDF, setShowInvoiceReceiptPDF] = useState<
    string | null
  >(null);
  const [pdfFileDetails, setPDFFileDetails] = useState<{
    fileType?: "INVOICE" | "RECEIPT";
    fileTypeId?: number;
  } | null>(null);

  const [makePayment, setMakePayment] = useState<{ id: number } | null>(null);

  const typeFilter = (
    <Combobox
      control={control}
      name={"type"}
      options={invoiceTypesDropDown?.getInvoiceType?.filter(notEmpty) || []}
      label="Type"
      variant="small"
      className="min-w-[220px] max-w-[220px]"
      canClear
      loading={invoiceTypesDropDownLoading}
    />
  );

  const paymentPaidAction = (
    id: number | null,
    status: InvoiceStatus,
    paymentMethod: InvoicePaymentMethod,
    ids: number[] | null = null
  ) => {
    if (id) {
      updateMutation({
        variables: {
          id: id,
          status: status,
          paymentMethod: paymentMethod,
          isInvoiceStatusNeed: true,
          isInvoiceReceiptIdNeed: true,
          isInvoiceUpdatedAtNeed: true,
        },
      })
        .then((res) => {
          if (res?.data?.updateInvoice?.id) {
            closeConfirmModal();
            const queryArgs = commonQueryArgs;

            queryArgs.globalSearch = undefined;

            reobserve({
              variables: queryArgs,
              fetchPolicy: "network-only",
            }).catch((error) => {
              toastNotification(messageHelper(error));
            });

            // updateQuery(({ filterInvoices }) => {
            //   return {
            //     filterInvoices: filterInvoices
            //       ? {
            //           pageInfo: filterInvoices?.pageInfo,
            //           edges:
            //             filterInvoices?.edges &&
            //             filterInvoices?.edges?.length > 0
            //               ? filterInvoices?.edges?.map((edge) => {
            //                   if (edge?.node?.id === id) {
            //                     return {
            //                       node: {
            //                         id: id,
            //                         ...edge?.node,
            //                         status: res?.data?.updateInvoice?.status,
            //                         receiptId:
            //                           res?.data?.updateInvoice?.receiptId,
            //                         updatedAt:
            //                           res?.data?.updateInvoice?.updatedAt,
            //                       },
            //                       cursor: edge?.cursor,
            //                     };
            //                   }
            //                   return edge;
            //                 }) || []
            //               : [],
            //           __typename: filterInvoices?.__typename,
            //         }
            //       : null,
            //   };
            // });
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((err) => {
          toastNotification(messageHelper(err));
        });
    } else if (ids && ids?.length > 0) {
      updateBulkActionMutation({
        variables: {
          invoiceIds: ids,
          paymentMethod: paymentMethod,
        },
      })
        .then((response) => {
          if (response) {
            closeConfirmModal();
            resetField("bulkAction", { defaultValue: null });
            toastNotification(updateSuccessMessage);
            // refetch();
            const queryArgs = commonQueryArgs;

            queryArgs.globalSearch = undefined;

            reobserve({
              variables: queryArgs,
              fetchPolicy: "network-only",
            }).catch((error) => {
              toastNotification(messageHelper(error));
            });
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((error) => {
          toastNotification(messageHelper(error));
        });
    }
  };

  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  return (
    <div className="space-y-6 w-full sm:max-w-6xl">
      <div className="flex justify-between gap-2 py-2">
        <TitleAndBreadcrumb
          title="Sales"
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Sales",
              to: "/sales",
            },
          ]}
        />
        {watchPageStatus !== "CANCELLED" &&
        watchFromHQOrWithFranchisee !== "FROM HQ" &&
        canCreate ? (
          <Button
            onPress={() => {
              navigate({
                to: "/sales/$saleId",
                params: {
                  saleId: "new",
                },
                search: {
                  pageStatus: watchPageStatus,
                },
              });
            }}
            className={
              "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[0.4px]"
            }
          >
            <AddIcon />
            CREATE {isFranchisee ? "SALES" : "INVOICE"}
          </Button>
        ) : null}
      </div>
      <div className="flex items-center flex-wrap lg:flex-nowrap justify-between lg:flex-row gap-6">
        {isMasterFranchisee ? (
          <Controller
            name="fromHQOrWithFranchisee"
            control={control}
            shouldUnregister
            render={({ field: { value, onChange } }) => {
              return (
                <_RadioGroup
                  value={value}
                  onChange={(value) => {
                    setTableLoading(true);
                    onChange(value);
                  }}
                  className={"flex overflow-x-auto md:overflow-x-visible"}
                >
                  {["FROM HQ", "WITH FRANCHISEE"]?.map((option) => {
                    return (
                      <_RadioGroup.Option
                        value={option}
                        key={option}
                        className={({ checked }) =>
                          combineClassName(
                            "w-[154px] min-w-[154px] flex justify-center items-center border-b-2 text-sm font-medium py-3 px-2 cursor-pointer",
                            checked
                              ? "text-primary-main border-b-primary-main"
                              : "text-secondary-text border-b-transparent"
                          )
                        }
                      >
                        {option}
                      </_RadioGroup.Option>
                    );
                  })}
                </_RadioGroup>
              );
            }}
          />
        ) : null}
        <RadioGroup
          control={control}
          name="pageStatus"
          options={["INVOICE/RECEIPT", "CANCELLED"]}
          variant="filled"
          className="flex justify-center xl:justify-end whitespace-nowrap"
          onChange={() => {
            resetField("search", { defaultValue: "" });
            resetField("sortBy", {
              defaultValue: { column: "id", direction: "descending" },
            });
            resetField("cursor", { defaultValue: null });
          }}
        />
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <div className="flex-1 flex flex-wrap justify-center md:justify-start gap-3">
          <InputField
            type="search"
            name={"search"}
            control={control}
            debounceOnChange={onSearchChange}
            className="min-w-[220px] max-w-[220px]"
            variant="small"
          />
          {isFranchisee && watchPageStatus !== "CANCELLED" && (
            <Select
              control={control}
              name={"bulkAction"}
              onChange={(bulkAction) => {
                if (bulkAction === "Paid") {
                  const selectedKeyList =
                    selectedKeys !== "all"
                      ? new Set(selectedKeys)
                      : new Set([]);

                  const filteredRowList =
                    selectedKeys === "all"
                      ? rows?.filter(
                          (rowDetails) => rowDetails?.status !== "Paid"
                        )
                      : rows
                          ?.filter(
                            (rowDetails) => rowDetails?.status !== "Paid"
                          )
                          ?.filter(
                            (data) => data?.id && selectedKeyList.has(data?.id)
                          );

                  if (
                    (selectedKeys === "all" || selectedKeys?.size > 0) &&
                    filteredRowList &&
                    filteredRowList?.length > 0
                  ) {
                    const [...keys] = filteredRowList?.map(
                      (row) => row?.id ?? null
                    );

                    if (
                      selectedKeys === "all" &&
                      filteredRowList
                        ?.map((row) => row?.id ?? null)
                        ?.filter(notEmpty)?.length > 0
                    ) {
                      setConfirmModal({
                        type: "bulkAction",
                        ids:
                          filteredRowList
                            ?.map((row) => row?.id ?? null)
                            ?.filter(notEmpty) ?? [],
                      });
                    } else if (keys?.length > 0) {
                      setConfirmModal({
                        type: "bulkAction",
                        ids: keys as unknown as number[],
                      });
                    } else {
                      toastNotification([
                        {
                          message: "Kindly select al least on sales order.",
                          messageType: "error",
                        },
                      ]);
                      resetField("bulkAction", { defaultValue: null });
                    }
                  } else {
                    toastNotification([
                      {
                        message: "Kindly select al least on sales order.",
                        messageType: "error",
                      },
                    ]);
                    resetField("bulkAction", { defaultValue: null });
                  }
                }
              }}
              variant="small"
              className="min-w-[220px] w-min bg-background-default"
              label="Bulk Action"
              options={["Paid"]}
            />
          )}
          {isAdmin || isMasterFranchisee
            ? isMasterFranchisee
              ? watchFromHQOrWithFranchisee !== "FROM HQ"
                ? typeFilter
                : null
              : isAdmin
              ? typeFilter
              : null
            : null}
          <DateField
            control={control}
            name={"dateRange"}
            label="Date Range"
            variant="small"
            type="date-range"
            className="w-min"
          />
        </div>
        {canDownloadCSV && totalCount > 0 && (
          <Button
            variant="outlined"
            onPress={generateCSVHandler}
            className={
              "min-w-[220px] w-min h-min flex items-center justify-center  whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px] shadow-none"
            }
            loading={csvFileLoading}
            loadingColor="secondary"
          >
            <DownloadIcon />
            DOWNLOAD CSV
          </Button>
        )}
      </div>
      {tableLoading ? (
        <div className="w-full min-h-80 border rounded divide-y divide-gray-200 bg-white flex items-center justify-center">
          <Loading color={"primary"} />
        </div>
      ) : (
        <Table
          name="Sales"
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
          selectionBehavior={isFranchisee ? "toggle" : undefined}
          selectionMode={isFranchisee ? "multiple" : undefined}
          onSelectionChange={isFranchisee ? setSelectedKeys : undefined}
          selectedKeys={isFranchisee ? selectedKeys : undefined}
        >
          <Head headers={tableHeaders} allowsSorting />
          <Body
            headers={tableHeaders}
            items={rows}
            defaultPageSize={defaultPageSize}
            loading={preLoading}
            className={
              "text-[14px] leading-5 tracking-[.17px] divide-y divide-gray-200"
            }
          >
            {(item) => (
              <Row
                key={item?.id}
                columns={tableHeaders}
                className={"hover:bg-action-hover focus:outline-none"}
              >
                {(column) => (
                  <Cell key={column?.id} className={"px-4 last:px-0"}>
                    {column?.id === "id" &&
                    isFranchisee &&
                    watchPageStatus !== "CANCELLED" ? (
                      <div className="flex gap-2 items-center">
                        <Checkbox slot={"selection"}>
                          {({
                            isIndeterminate,
                            isSelected,
                            isDisabled,
                            isReadOnly,
                          }) => {
                            return (
                              <CustomCheckbox
                                isChecked={
                                  item?.status !== "Paid" ? isSelected : false
                                }
                                isIndeterminate={isIndeterminate}
                                disabled={isDisabled}
                                readOnly={isReadOnly}
                              />
                            );
                          }}
                        </Checkbox>
                        <p>{item?.id}</p>
                      </div>
                    ) : column?.id === "action" ? (
                      <div className="flex items-center">
                        {isFranchisee &&
                        watchPageStatus === "CANCELLED" ? null : (
                          <TableAction<{
                            id:
                              | "View"
                              | "Paid"
                              | "Cancel"
                              | "View Invoice"
                              | "View Receipt"
                              | "Delete"
                              | "Pushed to Receipt"
                              | "Revert Back"
                              | "Issue Invoice"
                              | "Refund"
                              | "Make Payment";
                          }>
                            type="kebab"
                            items={kebabMenuList(item)}
                            onAction={(value) => {
                              kebabMenuAction(value, item);
                            }}
                          />
                        )}
                        {item?.id && (
                          <SalesItemAccordion
                            invoiceId={item?.id}
                            isMasterFranchisee={isMasterFranchisee}
                            fromHQOrWithFranchisee={
                              watchFromHQOrWithFranchisee || undefined
                            }
                          />
                        )}
                      </div>
                    ) : column?.id === "dateOfCreation" ? (
                      item?.dateOfCreation &&
                      formatDate(item?.dateOfCreation, "dd/MM/yyy") ? (
                        formatDate(item?.dateOfCreation, "dd/MM/yyy")
                      ) : (
                        "-"
                      )
                    ) : column?.id === "lastModifiedDate" ? (
                      item?.lastModifiedDate &&
                      formatDate(item?.lastModifiedDate, "dd/MM/yyy") ? (
                        formatDate(item?.lastModifiedDate, "dd/MM/yyy")
                      ) : (
                        "-"
                      )
                    ) : column?.id === "status" ? (
                      item?.status ? (
                        <p
                          className={combineClassName(
                            "px-2.5 py-2 rounded-full flex justify-center items-center w-min",
                            item?.status === "Pending"
                              ? "bg-action-selected text-primary-text"
                              : "",
                            item?.status === "Unpaid" ||
                              item?.status === "Canceled"
                              ? "bg-error-main text-white"
                              : "",
                            item?.status === "Paid"
                              ? "bg-success-main text-white"
                              : ""
                          )}
                        >
                          {item?.status}
                        </p>
                      ) : (
                        "-"
                      )
                    ) : item[column?.id] ? (
                      item[column?.id]
                    ) : (
                      "-"
                    )}
                  </Cell>
                )}
              </Row>
            )}
          </Body>
        </Table>
      )}

      {confirmModal?.type &&
      confirmModal?.type !== "Paid" &&
      confirmModal?.type !== "Pushed to Receipt" &&
      confirmModal?.type !== "bulkAction" ? (
        <ConfirmModal
          message={
            confirmModal?.type === "Cancel"
              ? watchPageStatus === "INVOICE/RECEIPT"
                ? "Confirm Cancel?"
                : ""
              : confirmModal?.type === "Revert Back"
              ? "Confirm Revert Back?"
              : confirmModal?.type === "Refund"
              ? "Confirm Refund?"
              : confirmModal?.type === "Delete"
              ? "Confirm Delete?"
              : confirmModal?.type === "Issue invoice"
              ? "Confirm issue invoice?"
              : ""
          }
          onClose={closeConfirmModal}
          button={{
            primary: {
              loading:
                updateLoading || sendInvoiceLoading || updateBulkActionLoading,
              onPress: confirmHandler,
            },
            secondary: {
              isDisabled:
                updateLoading || sendInvoiceLoading || updateBulkActionLoading,
            },
          }}
          isOpen={!!confirmModal?.type}
          loading={
            updateLoading || sendInvoiceLoading || updateBulkActionLoading
          }
        />
      ) : null}

      {confirmModal?.type === "Paid" ||
      confirmModal?.type === "Pushed to Receipt" ||
      confirmModal?.type === "bulkAction" ? (
        <Modal
          isOpen={
            confirmModal?.type === "bulkAction"
              ? confirmModal?.ids?.length > 0
                ? true
                : false
              : confirmModal?.type === "Paid" ||
                confirmModal?.type === "Pushed to Receipt"
          }
          onClose={closeConfirmModal}
          name="Add"
          className={combineClassName(
            "grid place-content-center gap-4 w-[210px] md:w-[350px]"
          )}
          loading={loading}
          modalClassName={combineClassName(
            "p-10 md:px-20 md:py-10 transition-all"
          )}
        >
          <p className="text-xl font-sunbird text-primary-text text-center">
            {confirmModal?.type === "Paid" ||
            confirmModal?.type === "bulkAction"
              ? "Confirm Paid?"
              : "Confirm Pushed to Receipt?"}
          </p>
          <Select
            control={control}
            name="paymentMethod"
            options={paymentMethodOptions}
            label="Payment Method"
            loading={getInvoicePaymentMethodLoading}
            className="w-full md:min-w-[380px]"
          />
          <div
            className={combineClassName(
              "flex justify-center items-center w-full gap-[14px]"
            )}
          >
            <Button
              variant={"outlined"}
              onPress={closeConfirmModal}
              className={combineClassName("min-w-[100px]")}
              isDisabled={updateLoading || updateBulkActionLoading}
            >
              {"CANCEL"}
            </Button>

            <Button
              variant={"filled"}
              className={combineClassName("min-w-[100px]")}
              // isDisabled={!watchPaymentMethod}
              loading={updateLoading || updateBulkActionLoading}
              onPress={() => {
                if (confirmModal?.type !== "bulkAction") {
                  if (watchPaymentMethod) {
                    clearErrors("paymentMethod");
                    paymentPaidAction(
                      confirmModal?.id,
                      "Paid",
                      watchPaymentMethod
                    );
                  } else {
                    setError("paymentMethod", {
                      type: "error",
                      message: "Payment method can't be blank",
                    });
                  }
                } else {
                  if (watchPaymentMethod) {
                    clearErrors("paymentMethod");
                    paymentPaidAction(
                      null,
                      "Paid",
                      watchPaymentMethod,
                      confirmModal?.ids
                    );
                  } else {
                    setError("paymentMethod", {
                      type: "error",
                      message: "Payment method can't be blank",
                    });
                  }
                }
              }}
            >
              {"CONFIRM"}
            </Button>
          </div>
        </Modal>
      ) : null}

      {showInvoiceReceiptPDF ? (
        <ViewInvoiceOrReceipt
          isOpen={!!showInvoiceReceiptPDF}
          onClose={() => {
            setShowInvoiceReceiptPDF(null);
            setPDFFileDetails(null);
          }}
          url={showInvoiceReceiptPDF}
          fileType={pdfFileDetails?.fileType}
          fileTypeId={pdfFileDetails?.fileTypeId}
        />
      ) : null}

      {makePayment?.id ? (
        <Modal
          isOpen={!!makePayment?.id}
          onClose={closeConfirmModal}
          name="Add"
          className={combineClassName(
            "grid place-content-center gap-4 md:w-[350px]"
          )}
          loading={loading}
          modalClassName={combineClassName(
            "p-10 md:px-20 md:py-10 transition-all"
          )}
        >
          <p className="text-xl font-normal font-sunbird text-primary-text text-center">
            Make Payment
          </p>
          <div>
            <p className="text-xl font-normal font-sunbird text-primary-text">
              Total Payable:
            </p>
            <p className="text-base font-normal text-primary-main">
              {data?.filterInvoices?.edges?.filter(
                (invoice) => invoice?.node?.id === makePayment?.id
              )?.[0]?.node?.total || 0}
            </p>
          </div>
          <Select
            control={control}
            name="paymentMethod"
            options={paymentMethodOptions}
            label="Payment Method"
            loading={getInvoicePaymentMethodLoading}
            className="w-full md:min-w-[380px]"
          />
          {/* <InputField
            control={control}
            name="numberOfPoints"
            label="Number of Points"
          /> */}
          <div
            className={combineClassName(
              "flex justify-center items-center w-full gap-[14px]"
            )}
          >
            <Button
              variant={"outlined"}
              onPress={closeConfirmModal}
              className={combineClassName("min-w-[100px]")}
              isDisabled={updateLoading}
            >
              {"CANCEL"}
            </Button>

            <Button
              variant={"filled"}
              className={combineClassName("min-w-[100px]")}
              // isDisabled={!watchPaymentMethod}
              loading={updateLoading}
              onPress={() => {
                if (watchPaymentMethod) {
                  clearErrors("paymentMethod");
                  paymentPaidAction(
                    makePayment?.id,
                    "Paid",
                    watchPaymentMethod
                  );
                } else {
                  setError("paymentMethod", {
                    type: "error",
                    message: "Payment method can't be blank",
                  });
                }
              }}
            >
              {"PROCEED"}
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
};

export default Sales;
