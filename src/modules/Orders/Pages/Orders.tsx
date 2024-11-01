/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Cell, Checkbox, Row, Selection } from "react-aria-components";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { Controller, useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { RadioGroup as _RadioGroup } from "@headlessui/react";

import { Body, Head, Table, TableAction } from "components/Table";
import { Button } from "components/Buttons";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import {
  CustomCheckbox,
  DateField,
  InputField,
  RadioGroup,
  Select,
} from "components/Form";
import { ConfirmModal } from "components/Modal";

import { paginationDefaultCount, toastNotification } from "global/cache";
import {
  useAllowedResource,
  useAuth,
  useFormWithZod,
  useGetSearchParamOnFirstMount,
} from "global/hook";
import {
  combineClassName,
  dateTimeSubmitFormat,
  fileDownload,
  formatDate,
  messageHelper,
  notEmpty,
  somethingWentWrongMessage,
} from "global/helpers";
import AddIcon from "global/assets/images/add-filled.svg?react";
import DownloadIcon from "global/assets/images/file-download-filled.svg?react";

import {
  CONFIRM_ORDERS,
  CONSOLIDATE_ORDERS,
  FILTER_ORDERS,
  FilterOrdersArgs,
  GENERATE_ORDER_CSV,
  GET_ORDER_STATUS,
  GET_ORDER_TYPE,
  OrderFieldArgs,
  UPDATE_ORDER,
  orderFilterSchema,
} from "modules/Orders";
import OrderPDF from "modules/Orders/Pages/OrderPDF";
import OrderItemAccordion from "modules/Orders/Pages/OrderItemAccordion";
import MakePaymentModal from "modules/Orders/Pages/MakePaymentModal";
import { Loading } from "components/Loading";

const queryFieldArgs: OrderFieldArgs = {
  isOrderOrderIdNeed: true,
  isOrderOrderingPartyNameNeed: true,
  isOrderOrderingPartyStudentNeed: true,
  isOrderCreatedAtNeed: true,
  isOrderPriceNeed: true,
  isOrderStatusNeed: true,
  isOrderTypeNeed: true,
  isOrderOrderingPartyFranchiseeNeed: true,
  isOrderOrderingPartyMFNeed: true,
  isOrderOrderItemsNeed: true,
  isOrderSalesOrderFileURLNeed: false,
  isOrderDeliverOrderFileURLNeed: false,
  isOrderPackingListFileURLNeed: false,
  isOrderTotalPriceNeed: true,
  isOrderOrderedToMFNeed: true,
};

const Orders = () => {
  const { authUserDetails } = useAuth();
  const [tableLoading, setTableLoading] = useState(false);

  const { canRead, canCreate, canUpdate } = useAllowedResource("Order", true);

  const canDownloadCSV = useAllowedResource("DownloadOrder");

  const isAdmin = authUserDetails?.type === "User";
  const isMasterFranchisee =
    authUserDetails?.type === "MF Owner" ||
    authUserDetails?.type === "MF Staff";
  const isFranchisee = authUserDetails?.type === "Franchisee";

  const navigate = useNavigate();
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { orderWith } = useGetSearchParamOnFirstMount({
    from: "/private-layout/orders/",
  });

  const { control, resetField } = useFormWithZod({
    schema: orderFilterSchema,
    defaultValues: {
      pageSize: defaultPageSize,
      sortBy: { column: "id", direction: "descending" },
      pageStatus: "ORDERS",
      orderWith: isAdmin
        ? null
        : isFranchisee
        ? "PENDING"
        : orderWith
        ? orderWith
        : "ORDER WITH HQ",
    },
  });

  const [
    watchSearch,
    watchPageSize,
    watchStatus,
    watchSortBy,
    watchOrderStatus,
    watchOrderType,
    watchDateRange,
    watchOrderWith,
  ] = useWatch({
    control,
    name: [
      "search",
      "pageSize",
      "status",
      "sortBy",
      "pageStatus",
      "orderType",
      "date",
      "orderWith",
    ],
  });

  const tableHeaders = [
    {
      name: "ID",
      id: "id",
      isRowHeader: true,
      showCheckbox:
        isFranchisee &&
        watchOrderStatus === "ORDERS" &&
        watchOrderWith === "PENDING"
          ? true
          : false,
    },
    { name: "Order ID", id: "orderId", hideSort: true },
    { name: "Order Party", id: "orderingParty", hideSort: true },
    { name: "Date of Creation", id: "dateOfCreation" },
    {
      name:
        isFranchisee || watchOrderWith === "WITH FRANCHISEE"
          ? "Price"
          : "Points",
      id: "points",
    },
    { name: "Status", id: "status" },
    { name: "Type", id: "type" },
    { name: "Actions", id: "action", hideSort: true },
  ];

  const commonQueryArgs: FilterOrdersArgs = useMemo(
    () => ({
      ...queryFieldArgs,
      pagination: { size: watchPageSize },
      globalSearch: undefined,
      sortBy: watchSortBy?.column
        ? {
            column:
              watchSortBy?.column === "dateOfCreation"
                ? "createdAt"
                : watchSortBy?.column === "points"
                ? "price"
                : watchSortBy?.column ?? "id",
            order:
              watchSortBy?.direction === "ascending"
                ? ("ASC" as const)
                : ("DESC" as const),
          }
        : undefined,
      filter: {
        status:
          watchOrderStatus === "ORDERS"
            ? watchStatus
              ? {
                  isExactly: watchStatus,
                }
              : isFranchisee
              ? {
                  inArray:
                    watchOrderWith === "PENDING"
                      ? ["Pending", "Edited"]
                      : watchOrderWith === "PROCESSED"
                      ? ["Order sent", "To process", "Shipped"]
                      : [],
                }
              : {
                  notInArray: ["Canceled"],
                }
            : { inArray: ["Canceled"] },
        type: watchOrderType
          ? {
              isExactly: watchOrderType,
            }
          : undefined,
        createdAt:
          watchDateRange && watchDateRange?.start && watchDateRange?.end
            ? {
                between: {
                  from: dateTimeSubmitFormat(watchDateRange?.start),
                  to: dateTimeSubmitFormat(watchDateRange?.end),
                },
              }
            : undefined,
        mfScreen: isMasterFranchisee
          ? watchOrderWith
            ? watchOrderWith === "ORDER WITH HQ"
              ? "HQ"
              : watchOrderWith === "WITH FRANCHISEE"
              ? "Franchisee"
              : "HQ"
            : "HQ"
          : undefined,
      },
    }),
    [
      watchOrderWith,
      watchOrderType,
      watchOrderStatus,
      watchStatus,
      watchSortBy?.direction,
      watchSortBy?.column,
      watchDateRange?.start,
      watchDateRange?.end,
    ]
  );

  const { data, loading, reobserve } = useQuery(FILTER_ORDERS, {
    variables: commonQueryArgs,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (!loading) {
      setTableLoading(false);
    }
  }, [loading]);

  const [updateMutation, { loading: updateLoading }] =
    useMutation(UPDATE_ORDER);

  const [generateCSV, { loading: csvFileLoading }] =
    useMutation(GENERATE_ORDER_CSV);

  const [confirmModal, setConfirmModal] = useState<
    | { type: "Pushed to invoice"; id: number }
    | { type: "Cancel"; id: number }
    | { type: "Shipped"; id: number }
    | { type: "Revert Order"; id: number }
    | { type: "Confirm Order"; id: number }
    | { type: "bulkAction"; ids: number[] }
    | { type: "To Process"; id: number }
    | { type: "Order with HQ"; id: number }
    | null
  >(null);

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  const [makePayment, setMakePayment] = useState<{
    id: number;
    totalPrice: number | null | undefined;
    balanceAvailable: number | null | undefined;
    pricePerSGD: number | null | undefined;
    mfId: number | null | undefined;
  } | null>(null);

  const rows =
    data?.filterOrders?.edges?.map((edge) => ({
      id: edge?.node?.id,
      orderId: edge?.node?.orderId,
      orderingParty:
        edge?.node?.orderingPartyName ??
        edge?.node?.orderingPartyMF?.masterFranchiseeName ??
        edge?.node?.orderingPartyFranchisee?.franchiseeName ??
        edge?.node?.orderingPartyStudent?.name ??
        null,
      dateOfCreation: formatDate(edge?.node?.createdAt, "dd/MM/yyyy"),
      points:
        edge?.node?.totalPrice && Number.isInteger(edge?.node?.totalPrice)
          ? edge?.node?.totalPrice
          : edge?.node?.totalPrice && edge?.node?.totalPrice?.toFixed(2),
      status: edge?.node?.status,
      type: edge?.node?.type,
      orderItems: edge?.node?.orderItems ?? [],
      salesURL: edge?.node?.salesOrderFileURL,
      deliveryURL: edge?.node?.deliverOrderFileURL,
      packageListURL: edge?.node?.packingListFileURL,
      orderingToMF: edge?.node?.orderedToMF,
      orderingPartyMF: edge?.node?.orderingPartyMF,
      action: "action" as const,
    })) || [];

  const onNext = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.globalSearch = watchSearch || undefined;

    queryArgs.pagination = {
      size: watchPageSize,
      after: data?.filterOrders?.pageInfo?.endCursor,
    };

    reobserve({
      variables: queryArgs,
      fetchPolicy: "network-only",
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });

    // fetchMore({
    //   variables: queryArgs,
    //   updateQuery: (_, { fetchMoreResult: { filterOrders } }) => {
    //     // setTableLoading(false);

    //     return { filterOrders };
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
      before: data?.filterOrders?.pageInfo?.startCursor,
    };

    reobserve({
      variables: queryArgs,
      fetchPolicy: "network-only",
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });

    // fetchMore({
    //   variables: queryArgs,
    //   updateQuery: (_, { fetchMoreResult: { filterOrders } }) => {
    //     // setTableLoading(false);

    //     return { filterOrders };
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
    //   updateQuery: (_, { fetchMoreResult: { filterOrders } }) => {
    //     // setTableLoading(false);

    //     return {
    //       filterOrders,
    //     };
    //   },
    // }).catch((error) => {
    //   toastNotification(messageHelper(error));
    // });
  };

  const totalCount = data?.filterOrders?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterOrders?.pageInfo?.hasNextPage &&
    data?.filterOrders?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterOrders?.pageInfo?.hasPreviousPage &&
    data?.filterOrders?.pageInfo?.startCursor
      ? true
      : false;

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
      //   updateQuery: (_, { fetchMoreResult: { filterOrders } }) => {
      //     // setTableLoading(false);

      //     return {
      //       filterOrders,
      //     };
      //   },
      // }).catch((error) => {
      //   toastNotification(messageHelper(error));
      // });
    }, []);

  const kebabMenuList: (item: (typeof rows)[number]) => {
    id:
      | "View"
      | "Edit"
      | "Pushed to Invoice"
      | "Cancel"
      | "View Sales Order"
      | "View Delivery Order"
      | "Shipped"
      | "Revert Back"
      | "Pushed to HQ"
      | "To Process"
      | "Order with HQ"
      | "Confirm Order"
      | "Delivery Order"
      | "View Packing List"
      | null;
  }[] = (item) =>
    item?.status === "Pending" && isAdmin
      ? [
          { id: canRead ? "View" : null },
          { id: canUpdate ? "Edit" : null },
          { id: canUpdate ? "To Process" : null },
          { id: canUpdate ? "Cancel" : null },
        ]
      : item?.status === "Edited" && isAdmin
      ? [
          { id: canRead ? "View Sales Order" : null },
          { id: canUpdate ? "Edit" : null },
          { id: canUpdate ? "To Process" : null },
          { id: canUpdate ? "Cancel" : null },
        ]
      : (item?.status === "Invoiced" || item?.status === "Order sent") &&
        (isAdmin || isMasterFranchisee || isFranchisee)
      ? isAdmin && item?.status === "Order sent"
        ? [
            { id: canRead ? "View Sales Order" : null },
            { id: canUpdate ? "To Process" : null },
            { id: canUpdate ? "Cancel" : null },
          ]
        : [
            { id: canRead ? "View Sales Order" : null },
            { id: canUpdate ? "Cancel" : null },
          ]
      : item?.status === "To process" &&
        (isAdmin || (isMasterFranchisee && watchOrderWith === "ORDER WITH HQ"))
      ? [
          { id: canRead ? "View Sales Order" : null },
          { id: canRead ? "View Delivery Order" : null },
          { id: canUpdate ? "Shipped" : null },
        ]
      : (item?.status === "Shipped" &&
          (isAdmin ||
            (isMasterFranchisee && watchOrderWith === "WITH FRANCHISEE"))) ||
        (item?.status === "Shipped" && isFranchisee)
      ? [
          { id: canRead ? "View Sales Order" : null },
          { id: canRead ? "View Delivery Order" : null },
          { id: canRead ? "View Packing List" : null },
        ]
      : item?.status === "Canceled" &&
        (isAdmin || isMasterFranchisee || isFranchisee)
      ? [
          { id: canRead ? "View" : null },
          { id: canUpdate ? "Revert Back" : null },
        ]
      : (item?.status === "Pending" || item?.status === "Edited") &&
        isMasterFranchisee &&
        watchOrderWith === "WITH FRANCHISEE"
      ? [
          { id: canRead ? "View Sales Order" : null },
          { id: canUpdate ? "Edit" : null },
          { id: canUpdate ? "Pushed to Invoice" : null },
          { id: canUpdate ? "Pushed to HQ" : null },
          { id: canUpdate ? "Cancel" : null },
          { id: canUpdate ? "To Process" : null },
        ]
      : item?.status === "Pending" &&
        isMasterFranchisee &&
        watchOrderWith === "ORDER WITH HQ"
      ? [
          { id: canRead ? "View" : null },
          { id: canUpdate ? "Edit" : null },
          {
            id: canUpdate
              ? item?.orderingPartyMF?.id
                ? "Order with HQ"
                : "Confirm Order"
              : null,
          },
          { id: canUpdate ? "Cancel" : null },
        ]
      : item?.status === "Edited" &&
        isMasterFranchisee &&
        watchOrderWith === "ORDER WITH HQ"
      ? [
          { id: canRead ? "View Sales Order" : null },
          { id: canUpdate ? "Edit" : null },
          {
            id: canUpdate
              ? item?.orderingPartyMF?.id
                ? "Order with HQ"
                : "Confirm Order"
              : null,
          },
          { id: canUpdate ? "Cancel" : null },
        ]
      : (item?.status === "Pending" || item?.status === "Edited") &&
        isFranchisee
      ? [
          { id: canRead ? "View" : null },
          { id: canUpdate ? "Edit" : null },
          { id: canUpdate ? "Confirm Order" : null },
          { id: canUpdate ? "Cancel" : null },
        ]
      : item?.status === "To process" && isFranchisee
      ? [
          { id: canRead ? "View" : null },
          { id: canUpdate ? "Delivery Order" : null },
        ]
      : item?.status === "To process" &&
        isMasterFranchisee &&
        watchOrderWith === "WITH FRANCHISEE"
      ? [
          { id: canRead ? "View Sales Order" : null },
          { id: canRead ? "View Delivery Order" : null },
          { id: canRead ? "View Packing List" : null },
          { id: canUpdate ? "Shipped" : null },
        ]
      : item?.status === "Shipped" &&
        isMasterFranchisee &&
        watchOrderWith === "ORDER WITH HQ"
      ? [
          { id: canRead ? "View Sales Order" : null },
          { id: canRead ? "View Delivery Order" : null },
        ]
      : [];

  const kebabMenuAction = (
    value: ReturnType<typeof kebabMenuList>[number]["id"],
    item: (typeof rows)[number]
  ) => {
    if (item?.id) {
      switch (value) {
        case "View": {
          setShowOrderPDF({
            id: item?.id,
            type: "view-sales",
            url: item?.salesURL,
          });

          break;
        }
        case "Edit": {
          navigate({
            to: "/orders/$orderId",
            params: {
              orderId: item?.id,
            },
            search: isMasterFranchisee
              ? {
                  orderWith: watchOrderWith,
                }
              : true,
          });
          break;
        }
        case "Pushed to Invoice": {
          setConfirmModal({
            id: item?.id,
            type: "Pushed to invoice",
          });

          break;
        }
        case "Cancel": {
          setConfirmModal({
            id: item?.id,
            type: "Cancel",
          });
          break;
        }
        case "View Sales Order": {
          setShowOrderPDF({
            id: item?.id,
            type: "sales",
            url: item?.salesURL,
          });

          break;
        }
        case "View Delivery Order": {
          setShowOrderPDF({
            id: item?.id,
            type: "delivery",
            url: item?.deliveryURL,
          });

          break;
        }
        case "Shipped": {
          setConfirmModal({
            id: item?.id,
            type: "Shipped",
          });
          break;
        }
        case "Revert Back": {
          setConfirmModal({
            id: item?.id,
            type: "Revert Order",
          });
          break;
        }
        case "Pushed to HQ": {
          setMakePayment({
            id: item?.id,
            balanceAvailable: item?.orderingToMF?.pointsAvailable,
            mfId: item?.orderingToMF?.id,
            pricePerSGD: item?.orderingToMF?.pricePerSGD,
            totalPrice: (item?.points && +item?.points) || null,
          });
          break;
        }
        case "To Process": {
          setConfirmModal({
            id: item?.id,
            type: "To Process",
          });
          break;
        }
        case "Order with HQ": {
          if (
            isMasterFranchisee &&
            watchOrderWith === "ORDER WITH HQ" &&
            item?.type === "Order in"
          ) {
            setConfirmModal({
              type: "Order with HQ",
              id: item?.id,
            });
          } else {
            setMakePayment({
              id: item?.id,
              balanceAvailable: item?.orderingPartyMF?.pointsAvailable,
              mfId: item?.orderingPartyMF?.id,
              pricePerSGD: item?.orderingPartyMF?.pricePerSGD,
              totalPrice: (item?.points && +item?.points) || null,
            });
          }

          break;
        }
        case "Confirm Order": {
          setConfirmModal({
            id: item?.id,
            type: "Confirm Order",
          });
          break;
        }
        case "Delivery Order": {
          setShowOrderPDF({
            id: item?.id,
            type: "delivery",
            url: item?.deliveryURL,
          });

          break;
        }
        case "View Packing List": {
          setShowOrderPDF({
            id: item?.id,
            type: "package-list",
            url: item?.packageListURL,
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
    generateCSV({
      variables: {
        mfScreen: isMasterFranchisee
          ? watchOrderWith
            ? watchOrderWith === "ORDER WITH HQ"
              ? "HQ"
              : watchOrderWith === "WITH FRANCHISEE"
              ? "Franchisee"
              : "HQ"
            : "HQ"
          : undefined,
      },
    })
      .then((response) => {
        if (
          response?.data?.generateOrderCSV !== null &&
          response?.data?.generateOrderCSV !== undefined &&
          response?.data?.generateOrderCSV?.length > 5
        ) {
          fileDownload(response?.data?.generateOrderCSV);
        } else {
          toastNotification(somethingWentWrongMessage);
        }
      })
      .catch((error) => {
        toastNotification(messageHelper(error));
      });
  };

  const { data: getOrderType, loading: getOrderTypeLoading } =
    useQuery(GET_ORDER_TYPE);
  const typeOptions = getOrderType?.getOrderType ?? [];

  const { data: getOrderStatus, loading: getOrderStatusLoading } =
    useQuery(GET_ORDER_STATUS);

  const statusOptions =
    getOrderStatus?.getOrderStatus?.filter((status) =>
      isFranchisee
        ? watchOrderWith === "PENDING"
          ? status == "Pending" || status === "Edited"
          : watchOrderWith === "PROCESSED"
          ? status == "Order sent" ||
            status === "Shipped" ||
            status === "To process"
          : status !== status
        : status !== "Canceled"
    ) ?? [];

  const [confirmOrderMutation, { loading: confirmOrderLoading }] =
    useMutation(CONFIRM_ORDERS);

  const [consolidateOrderMutation, { loading: consolidateOrderLoading }] =
    useMutation(CONSOLIDATE_ORDERS);

  const confirmHandler = () => {
    if (confirmModal?.type) {
      if (
        confirmModal?.type === "Confirm Order" ||
        confirmModal?.type === "Order with HQ"
      ) {
        confirmOrderMutation({
          variables: {
            orderIds: [confirmModal?.id],
          },
        })
          .then((res) => {
            if (res?.data) {
              closeConfirmModal();
              const queryArgs = commonQueryArgs;
              queryArgs.globalSearch = watchSearch || undefined;

              reobserve({
                variables: queryArgs,
                fetchPolicy: "network-only",
              }).catch((error) => {
                toastNotification(messageHelper(error));
              });

              // fetchMore({
              //   variables: queryArgs,
              //   updateQuery: (_, { fetchMoreResult: { filterOrders } }) => {
              //     // setTableLoading(false);

              //     return {
              //       filterOrders,
              //     };
              //   },
              // }).catch((error) => {
              //   toastNotification(messageHelper(error));
              // });
            }
          })
          .catch((error) => {
            toastNotification(messageHelper(error));
          });
      } else if (confirmModal?.type === "bulkAction") {
        consolidateOrderMutation({
          variables: {
            orderIds: confirmModal?.ids,
          },
        })
          .then((res) => {
            if (res?.data) {
              closeConfirmModal();
              const queryArgs = commonQueryArgs;
              queryArgs.globalSearch = watchSearch || undefined;

              reobserve({
                variables: queryArgs,
                fetchPolicy: "network-only",
              }).catch((error) => {
                toastNotification(messageHelper(error));
              });

              // fetchMore({
              //   variables: queryArgs,
              //   updateQuery: (_, { fetchMoreResult: { filterOrders } }) => {
              //     // setTableLoading(false);

              //     return {
              //       filterOrders,
              //     };
              //   },
              // }).catch((error) => {
              //   toastNotification(messageHelper(error));
              // });
              if (confirmModal?.type === "bulkAction") {
                resetField("bulkAction", { defaultValue: null });
                setSelectedKeys(new Set([]));
              }
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
              confirmModal?.type === "Cancel"
                ? "Canceled"
                : confirmModal?.type === "Pushed to invoice"
                ? "Invoiced"
                : confirmModal?.type === "Revert Order"
                ? "Pending"
                : confirmModal?.type === "Shipped"
                ? "Shipped"
                : confirmModal?.type === "To Process"
                ? "To process"
                : (null as unknown as "Shipped"),
          },
        })
          .then((res) => {
            if (res?.data?.updateOrder) {
              closeConfirmModal();

              if (data?.filterOrders?.edges?.length === 1) {
                resetField("search", {
                  defaultValue: "",
                });
                resetField("pageSize", {
                  defaultValue: defaultPageSize,
                });

                resetField("pageStatus", { defaultValue: "ORDERS" });

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
                //   updateQuery: (_, { fetchMoreResult: { filterOrders } }) => {
                //     // setTableLoading(false);

                //     return {
                //       filterOrders,
                //     };
                //   },
                // }).catch((error) => {
                //   toastNotification(messageHelper(error));
                // });
              } else if (data?.filterOrders?.pageInfo?.hasNextPage) {
                // const deleteItemIndex = data?.filterOrders?.edges?.findIndex(
                //   (edgeDetails) => edgeDetails?.node?.id === +confirmModal?.id
                // );

                // const nextPointCursorData =
                //   (deleteItemIndex || 0) + 1 === watchPageSize
                //     ? data &&
                //       data?.filterOrders &&
                //       data.filterOrders?.edges &&
                //       data.filterOrders?.edges[(deleteItemIndex || 0) - 1]
                //     : null;

                const queryArgs = commonQueryArgs;

                queryArgs.globalSearch = undefined;

                // queryArgs.pagination = {
                //   size: 1,
                //   after:
                //     nextPointCursorData?.cursor ||
                //     data?.filterOrders?.pageInfo?.endCursor,
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
                //   if (refetchRes?.data?.filterOrders?.edges?.length === 1) {
                //     updateQuery(({ filterOrders }) => {
                //       const olderRecord =
                //         filterOrders?.edges?.filter(
                //           (edgeDetails) =>
                //             edgeDetails?.node?.id !== confirmModal?.id
                //         ) || [];

                //       // setTableLoading(false);

                //       return {
                //         filterOrders: filterOrders
                //           ? {
                //               pageInfo: refetchRes?.data?.filterOrders?.pageInfo
                //                 ? {
                //                     ...filterOrders?.pageInfo,
                //                     endCursor:
                //                       refetchRes?.data?.filterOrders?.pageInfo
                //                         ?.endCursor,
                //                     hasNextPage:
                //                       refetchRes?.data?.filterOrders?.pageInfo
                //                         ?.hasNextPage,
                //                     totalNumberOfItems:
                //                       refetchRes?.data?.filterOrders?.pageInfo
                //                         ?.totalNumberOfItems,
                //                   }
                //                 : null,
                //               edges:
                //                 refetchRes?.data?.filterOrders?.edges &&
                //                 refetchRes?.data?.filterOrders?.edges?.length >
                //                   0
                //                   ? [
                //                       ...olderRecord,
                //                       ...(refetchRes?.data?.filterOrders
                //                         ?.edges || []),
                //                     ]
                //                   : [],
                //               __typename: filterOrders?.__typename,
                //             }
                //           : null,
                //       };
                //     });
                //   }
                // });
              } else {
                const queryArgs = commonQueryArgs;

                reobserve({
                  variables: queryArgs,
                  fetchPolicy: "network-only",
                }).catch((error) => {
                  toastNotification(messageHelper(error));
                });

                // fetchMore({
                //   variables: queryArgs,
                //   updateQuery: (_, { fetchMoreResult: { filterOrders } }) => {
                //     // setTableLoading(false);

                //     return {
                //       filterOrders,
                //     };
                //   },
                // }).catch((error) => {
                //   toastNotification(messageHelper(error));
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

  const [showOrderPDF, setShowOrderPDF] = useState<{
    id: number;
    type: "view-sales" | "sales" | "delivery" | "package-list";
    url: string | null | undefined;
  } | null>(null);

  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  return (
    <div className="space-y-6 w-full sm:max-w-[1300px]">
      <div className="flex justify-between gap-2 py-2">
        <TitleAndBreadcrumb
          title="Orders"
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Orders",
              to: "/orders",
            },
          ]}
        />
        {canCreate && (
          <Button
            onPress={() => {
              navigate({
                to: "/orders/$orderId",
                params: {
                  orderId: "new",
                },
                search: isMasterFranchisee
                  ? { orderWith: watchOrderWith }
                  : true,
              });
            }}
            className={
              "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px]"
            }
          >
            <AddIcon />
            CREATE ORDER
          </Button>
        )}
      </div>
      <div className="flex justify-between items-center">
        {isMasterFranchisee ? (
          <Controller
            name="orderWith"
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
                  {["ORDER WITH HQ", "WITH FRANCHISEE"]?.map((option) => {
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
          options={["ORDERS", "CANCELLED"]}
          variant="filled"
          className="flex justify-end"
          onChange={() => {
            resetField("search", { defaultValue: "" });
            resetField("sortBy", {
              defaultValue: { column: "id", direction: "descending" },
            });
            resetField("status", { defaultValue: null });
            resetField("orderType", { defaultValue: null });
            resetField("orderWith", {
              defaultValue: isFranchisee
                ? "PENDING"
                : isMasterFranchisee
                ? "ORDER WITH HQ"
                : null,
            });
            resetField("date", { defaultValue: null });
          }}
          classNameForFilledButton="py-2 px-[22px]"
        />
      </div>
      <div className="flex flex-wrap justify-center gap-4 w-full">
        <div className="flex justify-center items-center md:justify-start flex-wrap gap-3 flex-1">
          <InputField
            name={"search"}
            control={control}
            debounceOnChange={onSearchChange}
            variant="small"
            type="search"
            className="min-w-[200px]"
          />
          {watchOrderStatus === "ORDERS" ? (
            <Fragment>
              <Select
                control={control}
                name="orderType"
                label="Order Type"
                options={typeOptions}
                loading={getOrderTypeLoading}
                variant="small"
                className="min-w-[220px] max-w-[220px]"
                canClear
              />
              <Select
                control={control}
                name="status"
                label="Status"
                options={statusOptions}
                loading={getOrderStatusLoading}
                variant="small"
                className="min-w-[220px] max-w-[220px]"
                canClear
              />
            </Fragment>
          ) : null}

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
      {isFranchisee && watchOrderStatus === "ORDERS" && (
        <div
          className={
            watchOrderWith === "PENDING"
              ? "flex justify-between"
              : "flex justify-end"
          }
        >
          {watchOrderWith === "PENDING" && (
            <Select
              control={control}
              name={"bulkAction"}
              onChange={(bulkAction) => {
                if (bulkAction === "Confirm Order") {
                  if (selectedKeys === "all" || selectedKeys?.size > 0) {
                    const [...keys] = selectedKeys;
                    if (
                      selectedKeys === "all" &&
                      rows?.map((row) => row?.id ?? null)?.filter(notEmpty)
                        ?.length > 0
                    ) {
                      setConfirmModal({
                        type: "bulkAction",
                        ids:
                          rows
                            ?.map((row) => row?.id ?? null)
                            ?.filter(notEmpty) ?? [],
                      });
                    } else {
                      setConfirmModal({
                        type: "bulkAction",
                        ids: keys as unknown as number[],
                      });
                    }
                  } else {
                    toastNotification([
                      {
                        message: "Kindly select al least on order.",
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
              options={["Confirm Order"]}
            />
          )}
          <Controller
            name="orderWith"
            control={control}
            render={({ field: { value, onChange } }) => {
              return (
                <_RadioGroup
                  value={value}
                  onChange={onChange}
                  className={"flex overflow-x-auto md:overflow-x-visible"}
                >
                  {["PENDING", "PROCESSED"]?.map((option) => {
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
        </div>
      )}
      {tableLoading ? (
        <div className="w-full min-h-80 border rounded divide-y divide-gray-200 bg-white flex items-center justify-center">
          <Loading color={"primary"} />
        </div>
      ) : (
        <Table
          name="Orders"
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
          loading={loading}
          className={"font-roboto rounded"}
          control={control}
          selectionBehavior={
            isFranchisee &&
            watchOrderStatus === "ORDERS" &&
            watchOrderWith === "PENDING"
              ? "toggle"
              : undefined
          }
          selectionMode={
            isFranchisee &&
            watchOrderStatus === "ORDERS" &&
            watchOrderWith === "PENDING"
              ? "multiple"
              : undefined
          }
          onSelectionChange={
            isFranchisee &&
            watchOrderStatus === "ORDERS" &&
            watchOrderWith === "PENDING"
              ? setSelectedKeys
              : undefined
          }
          selectedKeys={
            isFranchisee &&
            watchOrderStatus === "ORDERS" &&
            watchOrderWith === "PENDING"
              ? selectedKeys
              : undefined
          }
        >
          <Head headers={tableHeaders} allowsSorting />
          <Body
            headers={tableHeaders}
            items={rows}
            defaultPageSize={defaultPageSize}
            loading={loading}
            className={
              "text-[14px] leading-5 tracking-[.17px] divide-y divide-gray-200"
            }
          >
            {(item) => (
              <Row
                columns={tableHeaders}
                className={"hover:bg-action-hover focus:outline-none"}
              >
                {(column) => (
                  <Cell className={"px-4 last:px-0"}>
                    {column?.id === "id" &&
                    isFranchisee &&
                    watchOrderWith === "PENDING" &&
                    watchOrderStatus === "ORDERS" ? (
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
                                isChecked={isSelected}
                                isIndeterminate={isIndeterminate}
                                disabled={isDisabled}
                                readOnly={isReadOnly}
                              />
                            );
                          }}
                        </Checkbox>
                        <p>{item?.id}</p>
                      </div>
                    ) : item[column?.id] ? (
                      item[column?.id] === "action" ? (
                        <div className="flex items-center">
                          <TableAction
                            type={"kebab"}
                            items={kebabMenuList(item)}
                            onAction={(value) => {
                              kebabMenuAction(value?.id ?? null, item);
                            }}
                          />
                          <OrderItemAccordion orderItems={item?.orderItems} />
                        </div>
                      ) : item[column?.id] === "Pending" ||
                        item[column?.id] === "Invoiced" ||
                        item[column?.id] === "Shipped" ||
                        item[column?.id] === "Edited" ||
                        item[column?.id] === "To process" ||
                        item[column?.id] === "Order sent" ||
                        item[column?.id] === "Canceled" ? (
                        <Button
                          className={`w-min whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] font-normal shadow-none  border-none ${
                            item?.status === "Pending"
                              ? "bg-none bg-action-selected text-primary-text"
                              : item?.status === "Invoiced"
                              ? "bg-none bg-secondary-main text-white"
                              : item?.status === "Shipped"
                              ? "bg-none bg-success-main text-white"
                              : item?.status === "Edited"
                              ? "bg-none bg-warning-main text-white"
                              : item?.status === "To process"
                              ? "bg-none bg-info-main text-white"
                              : item?.status === "Canceled"
                              ? "bg-none bg-error-main text-white"
                              : item?.status === "Order sent"
                              ? "bg-none bg-black/20 text-primary-text"
                              : ""
                          }`}
                          isDisabled
                        >
                          {item?.status === "To process"
                            ? "Process"
                            : item?.status}
                        </Button>
                      ) : (
                        //     : column?.id === "points" ? (
                        // item[column?.id] && Number.isInteger(item[column?.id]) ? (
                        //   item[column?.id]
                        // ) : (
                        //   item[column?.id]?.toFixed(2)
                        // )
                        //     )
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
      )}
      {confirmModal?.type && (
        <ConfirmModal
          message={`${
            confirmModal?.type === "Pushed to invoice"
              ? "Confirm Pushed to Invoice?"
              : confirmModal?.type === "Cancel"
              ? "Confirm Cancel Order?"
              : confirmModal?.type === "Shipped"
              ? "Confirm Shipped?"
              : confirmModal?.type === "Confirm Order" ||
                confirmModal?.type === "Order with HQ"
              ? "Confirm Orders?"
              : confirmModal?.type === "bulkAction"
              ? "Confirm Order Bulk Action?"
              : confirmModal?.type === "To Process"
              ? "Pushed To Process?"
              : "Confirm Revert Orders?"
          }`}
          onClose={closeConfirmModal}
          button={{
            primary: {
              loading:
                updateLoading || confirmOrderLoading || consolidateOrderLoading,
              onPress: confirmHandler,
            },
            secondary: {
              isDisabled:
                updateLoading || confirmOrderLoading || consolidateOrderLoading,
            },
          }}
          isOpen={
            confirmModal?.type === "bulkAction"
              ? confirmModal?.ids?.length > 0
                ? true
                : false
              : !!confirmModal?.id
          }
          loading={
            updateLoading || confirmOrderLoading || consolidateOrderLoading
          }
        />
      )}

      {showOrderPDF?.id ? (
        <OrderPDF
          isOpen={!!showOrderPDF?.id}
          onClose={() => {
            setShowOrderPDF(null);
          }}
          pageType={{
            id: showOrderPDF?.id,
            type: "view-order-pdf",
            pdfType: showOrderPDF?.type,
          }}
          isMasterFranchisee={isMasterFranchisee}
          isFranchisee={isFranchisee}
          watchOrderWith={watchOrderWith}
          url={showOrderPDF?.url}
          reobserve={reobserve}
          commonQueryArgs={commonQueryArgs}
        />
      ) : null}

      {makePayment?.id ? (
        <MakePaymentModal
          isOpen={!!makePayment?.id}
          makePayment={makePayment}
          navigate={navigate}
          onClose={() => {
            setMakePayment(null);
          }}
          reobserve={reobserve}
          queryArgs={commonQueryArgs}
          // setTableLoading={setTableLoading}
        />
      ) : null}
    </div>
  );
};

export default Orders;
