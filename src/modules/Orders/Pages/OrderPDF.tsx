import { FC, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useNavigate } from "@tanstack/react-router";
import {
  ApolloQueryResult,
  NetworkStatus,
  WatchQueryOptions,
  useMutation,
  useQuery,
} from "@apollo/client";

import { Button } from "components/Buttons";
import { Tooltip } from "components/Tooltip";
import { Modal } from "components/Modal";

import CancelIcon from "global/assets/images/close-filled.svg?react";
import { toastNotification } from "global/cache";
import { usePreLoading } from "global/hook";
import {
  fileDownload,
  messageHelper,
  somethingWentWrongMessage,
} from "global/helpers";

import {
  CONFIRM_ORDERS,
  FILTER_ORDERS,
  FilterOrdersArgs,
  FilterOrdersResponse,
  // GENERATE_DELIVERY_ORDER_PDF,
  // GENERATE_PACKAGE_LIST_PDF,
  // GENERATE_SALES_ORDER_PDF,
  SEND_DELIVERY_ORDER_MAIL,
  SEND_PACKAGE_LIST_MAIL,
  SEND_SALES_ORDER_MAIL,
} from "modules/Orders";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pageType:
    | {
        type: "order-form";
        id: number;
        pdfType: "view-sales" | "sales" | "delivery" | "package-list";
      }
    | {
        type: "view-order-pdf";
        id: number;
        pdfType: "view-sales" | "sales" | "delivery" | "package-list";
      };
  watchOrderWith:
    | "ORDER WITH HQ"
    | "WITH FRANCHISEE"
    | "PENDING"
    | "PROCESSED"
    | null
    | undefined;
  isMasterFranchisee: boolean;
  isFranchisee: boolean;
  url: string | null | undefined;
  reobserve?: (
    newOptions?: Partial<
      WatchQueryOptions<FilterOrdersArgs, FilterOrdersResponse>
    >,
    newNetworkStatus?: NetworkStatus
  ) => Promise<ApolloQueryResult<FilterOrdersResponse>>;
  commonQueryArgs: FilterOrdersArgs;
}
const OrderPDF: FC<Props> = ({
  isOpen,
  onClose,
  pageType,
  watchOrderWith,
  isMasterFranchisee,
  isFranchisee,
  // url,
  reobserve,
  commonQueryArgs,
}) => {
  const navigate = useNavigate();
  const [numPages, setNumPages] = useState<number>();
  const [fileLoading, setFileLoading] = useState(true);

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
    setFileLoading(false);
  }

  const [sendSalesOrderMail, { loading: sendSalesOrderMailLoading }] =
    useMutation(SEND_SALES_ORDER_MAIL);

  const [sendDeliveryOrderMail, { loading: sendDeliveryOrderMailLoading }] =
    useMutation(SEND_DELIVERY_ORDER_MAIL);

  const [sendPackageListMail, { loading: sendPackageListLoading }] =
    useMutation(SEND_PACKAGE_LIST_MAIL);

  const [confirmOrderMutation, { loading: confirmOrderLoading }] =
    useMutation(CONFIRM_ORDERS);

  const sendMailHandler = (
    id: number,
    type: "sales" | "delivery" | "package-list"
  ) => {
    if (type === "sales") {
      sendSalesOrderMail({
        variables: {
          orderId: id,
        },
      })
        .then(({ data }) => {
          if (data?.sendSalesOrderMail) {
            toastNotification([
              {
                message: "Email has been sent to the ordering party",
                messageType: "success",
              },
            ]);
            onClose();
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((err) => toastNotification(messageHelper(err)));
    }

    if (type === "delivery") {
      sendDeliveryOrderMail({
        variables: {
          orderId: id,
        },
      })
        .then(({ data }) => {
          if (data?.sendDeliveryOrderMail) {
            toastNotification([
              {
                message: "Email has been sent to the ordering party",
                messageType: "success",
              },
            ]);
            onClose();
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((err) => toastNotification(messageHelper(err)));
    }
    if (type === "package-list") {
      sendPackageListMail({
        variables: {
          orderId: id,
        },
      })
        .then(({ data }) => {
          if (data?.sendPackingListMail) {
            toastNotification([
              {
                message: "Email has been sent to the ordering party",
                messageType: "success",
              },
            ]);
            onClose();
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((err) => toastNotification(messageHelper(err)));
    }
  };

  const { data, loading } = useQuery(FILTER_ORDERS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    variables: {
      filter: {
        id: {
          number: pageType?.id,
        },
        mfScreen: isMasterFranchisee
          ? watchOrderWith
            ? watchOrderWith === "ORDER WITH HQ"
              ? "HQ"
              : watchOrderWith === "WITH FRANCHISEE"
              ? "Franchisee"
              : undefined
            : "HQ"
          : undefined,
      },
      isOrderSalesOrderFileURLNeed:
        pageType?.pdfType === "sales" || pageType?.pdfType === "view-sales",
      isOrderDeliverOrderFileURLNeed: pageType?.pdfType === "delivery",
      isOrderPackingListFileURLNeed: pageType?.pdfType === "package-list",
      isOrderStatusNeed: isFranchisee,
    },
  });

  // const { loading: generateSalesOrderPDFLoading, data: generateSalesOrderPDF } =
  //   useQuery(GENERATE_SALES_ORDER_PDF, {
  //     variables: {
  //       orderId: pageType?.id,
  //     },
  //     skip: url
  //       ? true
  //       : pageType?.pdfType === "sales" || pageType?.pdfType === "view-sales"
  //       ? false
  //       : true,
  //   });

  // const {
  //   loading: generateDeliveryOrderPDFLoading,
  //   data: generateDeliveryOrderPDF,
  // } = useQuery(GENERATE_DELIVERY_ORDER_PDF, {
  //   variables: {
  //     orderId: pageType?.id,
  //   },
  //   skip: url ? true : pageType?.pdfType !== "delivery",
  // });

  // const {
  //   loading: generatePackageListOrderPDFLoading,
  //   data: generatePackageListOrderPDF,
  // } = useQuery(GENERATE_PACKAGE_LIST_PDF, {
  //   variables: {
  //     orderId: pageType?.id,
  //   },
  //   skip: url ? true : pageType?.pdfType === "package-list" ? false : true,
  // });

  // const preLoading = usePreLoading(
  //   generateSalesOrderPDFLoading ||
  //     generateDeliveryOrderPDFLoading ||
  //     generatePackageListOrderPDFLoading
  // );
  // const fileURL = url
  //   ? url
  //   : pageType?.pdfType === "delivery"
  //   ? generateDeliveryOrderPDF?.generateDeliveryOrderPdf?.filePath
  //   : pageType?.pdfType === "package-list"
  //   ? generatePackageListOrderPDF?.generatePackingListOrderPdf?.filePath
  //   : generateSalesOrderPDF?.generateSalesOrderPdf?.filePath;

  const preLoading = usePreLoading(loading);

  const fileURL =
    pageType?.pdfType === "delivery"
      ? data?.filterOrders?.edges?.[0]?.node?.deliverOrderFileURL
      : pageType?.pdfType === "package-list"
      ? data?.filterOrders?.edges?.[0]?.node?.packingListFileURL
      : data?.filterOrders?.edges?.[0]?.node?.salesOrderFileURL;

  const confirmOrderHandler = () => {
    if (pageType?.id) {
      confirmOrderMutation({
        variables: {
          orderIds: [pageType?.id],
        },
      })
        .then((res) => {
          if (res?.data) {
            const queryArgs = commonQueryArgs;

            onClose();

            if (pageType?.type === "order-form") {
              navigate({
                to: "/orders",
              });
            } else {
              reobserve &&
                reobserve({
                  fetchPolicy: "network-only",
                  variables: queryArgs,
                }).catch((error) => {
                  toastNotification(messageHelper(error));
                });
            }

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
    } else {
      toastNotification(somethingWentWrongMessage);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (
          sendSalesOrderMailLoading ||
          sendDeliveryOrderMailLoading ||
          sendPackageListLoading
        ) {
        } else if (pageType?.type === "order-form") {
          onClose();
          navigate({
            to: "/orders",
          });
        } else {
          onClose();
        }
      }}
      name="PDF Render"
      className="min-h-[80vh] max-h-[80vh] rounded-2xl p-6 flex justify-between flex-col"
    >
      <div className="flex justify-end gap-2">
        <Tooltip
          renderer={"Close"}
          isArrow
          triggerProps={{
            className:
              "text-secondary-text focus:outline-none hover:bg-action-hover focus-visible:bg-action-hover rounded-full p-0 min-w-10 min-h-10 border-none shadow-none text-secondary-text w-10 h-10 flex justify-center items-center",
            onPress: () => {
              if (pageType?.type === "order-form") {
                onClose();
                navigate({
                  to: "/orders",
                });
              } else {
                onClose();
              }
            },
          }}
        >
          <CancelIcon />
        </Tooltip>
      </div>
      {preLoading ? (
        <div className="min-h-[61vh] min-w-[610px] flex justify-center items-center">
          Loading...
        </div>
      ) : fileURL ? (
        <div className="w-full min-w-full overflow-y-auto">
          <Document
            file={fileURL}
            onLoadSuccess={onDocumentLoadSuccess}
            className={
              "w-full min-w-full flex justify-center flex-col max-h-[inherit]"
            }
            loading={
              <div className="min-h-[61vh] min-w-[610px] flex justify-center items-center">
                Loading...
              </div>
            }
            error={() => {
              setFileLoading(false);
              return (
                <div className="min-h-[61vh] min-w-[610px] flex justify-center items-center rounded-md">
                  No data found.
                </div>
              );
            }}
          >
            {Array.from(new Array(numPages), (_, index) => (
              <div key={`page_${index + 1}`} className={"rounded-[10px]"}>
                <Page pageNumber={index + 1} />
              </div>
            ))}
          </Document>
        </div>
      ) : (
        <div className="min-h-[61vh] min-w-[610px] flex justify-center items-center rounded-md">
          No data found.
        </div>
      )}
      {preLoading || fileLoading ? null : (
        <div className="pt-8 flex justify-end gap-2 whitespace-nowrap">
          <Button
            className="w-min shadow-none"
            variant="outlined"
            onPress={() => {
              if (
                pageType?.type === "view-order-pdf" &&
                pageType?.pdfType !== "view-sales"
              ) {
                fileDownload(fileURL);
              } else {
                navigate({
                  to: "/orders/$orderId",
                  params: {
                    orderId: pageType?.id,
                  },
                  search: isMasterFranchisee
                    ? { orderWith: watchOrderWith }
                    : true,
                });
                onClose();
              }
            }}
            isDisabled={
              pageType?.type === "view-order-pdf"
                ? fileURL
                  ? sendSalesOrderMailLoading ||
                    sendDeliveryOrderMailLoading ||
                    sendPackageListLoading
                  : true
                : sendSalesOrderMailLoading ||
                  sendDeliveryOrderMailLoading ||
                  sendPackageListLoading
            }
          >
            {pageType?.type === "view-order-pdf"
              ? pageType?.pdfType === "view-sales"
                ? "EDIT"
                : "DOWNLOAD"
              : "EDIT"}
          </Button>
          {isFranchisee &&
          (data?.filterOrders?.edges?.[0]?.node?.status === "Order sent" ||
            data?.filterOrders?.edges?.[0]?.node?.status === "Shipped") &&
          pageType?.pdfType === "sales" ? null : (
            <Button
              className="w-min whitespace-nowrap"
              onPress={() => {
                if (pageType?.type === "order-form") {
                  confirmOrderHandler();
                } else {
                  if (pageType?.pdfType === "view-sales") {
                    confirmOrderHandler();
                  } else {
                    sendMailHandler(pageType?.id, pageType?.pdfType);
                  }
                }
              }}
              loading={
                sendSalesOrderMailLoading ||
                sendDeliveryOrderMailLoading ||
                sendPackageListLoading ||
                confirmOrderLoading
              }
            >
              {pageType?.type === "view-order-pdf"
                ? pageType?.pdfType === "package-list"
                  ? "SEND PACKAGE LIST ORDER"
                  : pageType?.pdfType === "view-sales"
                  ? "CONFIRM"
                  : pageType?.pdfType === "delivery"
                  ? "SEND DELIVERY ORDER"
                  : "SEND EMAIL"
                : "CONFIRM"}
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
};

export default OrderPDF;
