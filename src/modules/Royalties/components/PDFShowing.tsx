import { FC, Fragment, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

import { Modal } from "components/Modal";
import { Button } from "components/Buttons";
import { Tooltip } from "components/Tooltip";

import { RefetchQueryType, SetState } from "global/types";
import { toastNotification } from "global/cache";
import {
  combineClassName,
  fileDownload,
  messageHelper,
  somethingWentWrongMessage,
} from "global/helpers";
import { useAuth } from "global/hook";
import CloseIcon from "global/assets/images/close-filled.svg?react";

import {
  FILTER_HQ_ROYALTIES,
  FILTER_MASTER_FRANCHISEE_ROYALTIES,
  FilterHQRoyaltiesArgs,
  FilterHQRoyaltiesResponse,
  FilterMasterFranchiseeRoyaltiesArgs,
  FilterMasterFranchiseeRoyaltiesResponse,
  GENERATE_ROYALTY_PAYMENT_SUMMARY_PDF,
  HQRoyaltyFieldArgs,
  MasterFranchiseeRoyaltyFieldArgs,
  SEND_HQ_ROYALTY_INVOICE_MAIL,
  SEND_HQ_ROYALTY_RECEIPT_MAIL,
  SEND_MASTER_FRANCHISEE_ROYALTY_INVOICE_MAIL,
  SEND_MASTER_FRANCHISEE_ROYALTY_RECEIPT_MAIL,
  ShowPDF,
} from "modules/Royalties";

interface Props {
  isOpen: boolean;
  setPDFModal: SetState<ShowPDF | null>;
  pdfModal: ShowPDF;
  hqRoyaltyRefetch: RefetchQueryType<
    FilterHQRoyaltiesResponse,
    FilterHQRoyaltiesArgs
  >;
  mfRoyaltyRefetch: RefetchQueryType<
    FilterMasterFranchiseeRoyaltiesResponse,
    FilterMasterFranchiseeRoyaltiesArgs
  >;
}

const PDFShowing: FC<Props> = ({
  isOpen,
  setPDFModal,
  pdfModal,
  hqRoyaltyRefetch,
  mfRoyaltyRefetch,
}) => {
  const { authUserDetails } = useAuth();
  const isAdminUser = authUserDetails?.type === "User";
  const [numPages, setNumPages] = useState<number>();
  const [fileLoading, setFileLoading] = useState(true);
  const [pdfFileURL, setPDFFileURL] = useState<string | null>(null);

  const queryFieldArgs: HQRoyaltyFieldArgs | MasterFranchiseeRoyaltyFieldArgs =
    isAdminUser
      ? {
          isHQRoyaltyMasterFranchiseeInformationNeed:
            pdfModal?.modalFrom !== "Download PDF",
          isPaymentSummaryURLNeed:
            pdfModal?.modalFrom !== "Paid" &&
            pdfModal?.modalFrom !== "Download PDF",
          isReceiptURLNeed:
            pdfModal?.modalFrom === "Paid" ||
            pdfModal?.modalFrom === "Download PDF",
        }
      : {
          isMasterFranchiseeRoyaltyFranchiseeInformationNeed:
            pdfModal?.modalFrom !== "Download PDF",
          isPaymentSummaryURLNeed:
            pdfModal?.modalFrom !== "Paid" &&
            pdfModal?.modalFrom !== "Download PDF",
          isReceiptURLNeed:
            pdfModal?.modalFrom === "Paid" ||
            pdfModal?.modalFrom === "Download PDF",
        };

  const commonQueryArgs:
    | FilterHQRoyaltiesArgs
    | FilterMasterFranchiseeRoyaltiesArgs = {
    ...queryFieldArgs,
    filter: {
      id: {
        number: pdfModal?.royaltyId,
      },
    },
  };

  const { loading: hqRoyaltyLoading } = useQuery(FILTER_HQ_ROYALTIES, {
    skip: isAdminUser ? false : true,
    variables: commonQueryArgs,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    onCompleted: ({ filterHQRoyalties }) => {
      if (
        pdfModal?.modalFrom === "Paid" ||
        pdfModal?.modalFrom === "Download PDF"
      ) {
        if (
          filterHQRoyalties?.edges?.[0]?.node?.receiptURL !== null &&
          filterHQRoyalties?.edges?.[0]?.node?.receiptURL !== undefined &&
          filterHQRoyalties?.edges?.[0]?.node?.receiptURL?.length > 5 &&
          !filterHQRoyalties?.edges?.[0]?.node?.receiptURL
            ?.toLowerCase()
            ?.trim()
            ?.replaceAll(" ", "")
            ?.includes("nodatafound")
        ) {
          setPDFFileURL(filterHQRoyalties?.edges?.[0]?.node?.receiptURL);
        } else {
          setPDFFileURL(null);
        }
      } else {
        if (
          filterHQRoyalties?.edges?.[0]?.node?.paymentSummaryURL !== null &&
          filterHQRoyalties?.edges?.[0]?.node?.paymentSummaryURL !==
            undefined &&
          filterHQRoyalties?.edges?.[0]?.node?.paymentSummaryURL?.length > 5 &&
          !filterHQRoyalties?.edges?.[0]?.node?.paymentSummaryURL
            ?.toLowerCase()
            ?.trim()
            ?.replaceAll(" ", "")
            ?.includes("nodatafound")
        ) {
          setPDFFileURL(filterHQRoyalties?.edges?.[0]?.node?.paymentSummaryURL);
        } else {
          generateRoyaltyPaymentSummaryPDF({
            variables: {
              hqRoyaltyId: pdfModal?.royaltyId,
            },
          })
            .then((response) => {
              if (
                response?.data?.generateRoyaltyPaymentSummaryPdf?.filePath !==
                  null &&
                response?.data?.generateRoyaltyPaymentSummaryPdf?.filePath !==
                  undefined &&
                response?.data?.generateRoyaltyPaymentSummaryPdf?.filePath
                  ?.length > 5 &&
                !response?.data?.generateRoyaltyPaymentSummaryPdf?.filePath
                  ?.toLowerCase()
                  ?.trim()
                  ?.replaceAll(" ", "")
                  ?.includes("nodatafound")
              ) {
                setPDFFileURL(
                  response?.data?.generateRoyaltyPaymentSummaryPdf?.filePath
                );
              } else {
                setPDFFileURL(null);
              }
            })
            .catch((error) => {
              setPDFFileURL(null);
              toastNotification(messageHelper(error));
            });
        }
      }
    },
    onError: (error) => {
      setPDFFileURL(null);
      toastNotification(
        messageHelper({
          type: "success",
          message: error?.message,
        })
      );
    },
  });

  const { loading: masterFranchiseeRoyaltyLoading } = useQuery(
    FILTER_MASTER_FRANCHISEE_ROYALTIES,
    {
      skip: isAdminUser ? true : false,
      variables: commonQueryArgs,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      onCompleted: ({ filterMasterFranchiseeRoyalties }) => {
        if (
          pdfModal?.modalFrom === "Paid" ||
          pdfModal?.modalFrom === "Download PDF"
        ) {
          if (
            filterMasterFranchiseeRoyalties?.edges?.[0]?.node?.receiptURL !==
              null &&
            filterMasterFranchiseeRoyalties?.edges?.[0]?.node?.receiptURL !==
              undefined &&
            filterMasterFranchiseeRoyalties?.edges?.[0]?.node?.receiptURL
              ?.length > 5 &&
            !filterMasterFranchiseeRoyalties?.edges?.[0]?.node?.receiptURL
              ?.toLowerCase()
              ?.trim()
              ?.replaceAll(" ", "")
              ?.includes("nodatafound")
          ) {
            setPDFFileURL(
              filterMasterFranchiseeRoyalties?.edges?.[0]?.node?.receiptURL
            );
          } else {
            setPDFFileURL(null);
          }
        } else {
          if (
            filterMasterFranchiseeRoyalties?.edges?.[0]?.node
              ?.paymentSummaryURL !== null &&
            filterMasterFranchiseeRoyalties?.edges?.[0]?.node
              ?.paymentSummaryURL !== undefined &&
            filterMasterFranchiseeRoyalties?.edges?.[0]?.node?.paymentSummaryURL
              ?.length > 5 &&
            !filterMasterFranchiseeRoyalties?.edges?.[0]?.node?.paymentSummaryURL
              ?.toLowerCase()
              ?.trim()
              ?.replaceAll(" ", "")
              ?.includes("nodatafound")
          ) {
            setPDFFileURL(
              filterMasterFranchiseeRoyalties?.edges?.[0]?.node
                ?.paymentSummaryURL
            );
          } else {
            generateRoyaltyPaymentSummaryPDF({
              variables: {
                masterFranchiseeRoyaltyId: pdfModal?.royaltyId,
              },
            })
              .then((response) => {
                if (
                  response?.data?.generateRoyaltyPaymentSummaryPdf?.filePath !==
                    null &&
                  response?.data?.generateRoyaltyPaymentSummaryPdf?.filePath !==
                    undefined &&
                  response?.data?.generateRoyaltyPaymentSummaryPdf?.filePath
                    ?.length > 5 &&
                  !response?.data?.generateRoyaltyPaymentSummaryPdf?.filePath
                    ?.toLowerCase()
                    ?.trim()
                    ?.replaceAll(" ", "")
                    ?.includes("nodatafound")
                ) {
                  setPDFFileURL(
                    response?.data?.generateRoyaltyPaymentSummaryPdf?.filePath
                  );
                } else {
                  setPDFFileURL(null);
                }
              })
              .catch((error) => {
                setPDFFileURL(null);
                toastNotification(messageHelper(error));
              });
          }
        }
      },
      onError: (error) => {
        setPDFFileURL(null);
        toastNotification(
          messageHelper({
            type: "success",
            message: error?.message,
          })
        );
      },
    }
  );

  const [
    generateRoyaltyPaymentSummaryPDF,
    { loading: royaltyPaymentSummaryPDFLoading },
  ] = useLazyQuery(GENERATE_ROYALTY_PAYMENT_SUMMARY_PDF, {
    nextFetchPolicy: "cache-and-network",
  });

  const [
    sendHQRoyaltyInvoiceMail,
    { loading: sendHQRoyaltyInvoiceMailLoading },
  ] = useMutation(SEND_HQ_ROYALTY_INVOICE_MAIL);

  const [
    sendMasterFranchiseeRoyaltyInvoiceMail,
    { loading: sendMasterFranchiseeRoyaltyInvoiceMailLoading },
  ] = useMutation(SEND_MASTER_FRANCHISEE_ROYALTY_INVOICE_MAIL);

  const [
    sendHQRoyaltyReceiptMail,
    { loading: sendHQRoyaltyReceiptMailLoading },
  ] = useMutation(SEND_HQ_ROYALTY_RECEIPT_MAIL);

  const [
    sendMasterFranchiseeRoyaltyReceiptMail,
    { loading: sendMasterFranchiseeRoyaltyReceiptMailLoading },
  ] = useMutation(SEND_MASTER_FRANCHISEE_ROYALTY_RECEIPT_MAIL);

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
    setFileLoading(false);
  }

  const onCancelHandler = () => {
    setPDFModal(null);
    setPDFFileURL(null);
  };

  const onDownloadHandler = () => {
    fileDownload(pdfFileURL);
  };

  const onSendInvoiceHandler = () => {
    if (isAdminUser) {
      sendHQRoyaltyInvoiceMail({
        variables: {
          hqRoyaltyId: pdfModal?.royaltyId,
        },
      })
        .then((response) => {
          if (response?.data?.sendHQRoyaltyInvoiceMail) {
            toastNotification([
              {
                message: response?.data?.sendHQRoyaltyInvoiceMail,
                messageType: "success",
              },
            ]);
            setPDFModal(null);
            hqRoyaltyRefetch();
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((error) => {
          toastNotification(messageHelper(error));
        });
    } else {
      sendMasterFranchiseeRoyaltyInvoiceMail({
        variables: {
          mfRoyaltyId: pdfModal?.royaltyId,
        },
      })
        .then((response) => {
          if (response?.data?.sendMasterFranchiseeRoyaltyInvoiceMail) {
            toastNotification([
              {
                message: response?.data?.sendMasterFranchiseeRoyaltyInvoiceMail,
                messageType: "success",
              },
            ]);
            setPDFModal(null);
            mfRoyaltyRefetch();
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((error) => {
          toastNotification(messageHelper(error));
        });
    }
  };

  const onSendReceiptHandler = () => {
    if (isAdminUser) {
      sendHQRoyaltyReceiptMail({
        variables: {
          hqRoyaltyId: pdfModal?.royaltyId,
        },
      })
        .then((response) => {
          if (response?.data?.sendHQRoyaltyReceiptMail) {
            toastNotification([
              {
                message: response?.data?.sendHQRoyaltyReceiptMail,
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
      sendMasterFranchiseeRoyaltyReceiptMail({
        variables: {
          mfRoyaltyId: pdfModal?.royaltyId,
        },
      })
        .then((response) => {
          if (response?.data?.sendMasterFranchiseeRoyaltyReceiptMail) {
            toastNotification([
              {
                message: response?.data?.sendMasterFranchiseeRoyaltyReceiptMail,
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
    }
  };

  return (
    <Fragment>
      {isOpen ? (
        <Modal
          isOpen={isOpen}
          onClose={onCancelHandler}
          name="PDF Render"
          className="min-h-[80vh] max-h-[80vh] rounded-2xl flex justify-between flex-col"
        >
          <div className="flex justify-end p-6">
            <Tooltip
              renderer={"Close"}
              isArrow
              triggerProps={{
                className: "text-secondary-text focus:outline-none",
                onPress: onCancelHandler,
              }}
            >
              <CloseIcon onClick={onCancelHandler} />
            </Tooltip>
          </div>
          {hqRoyaltyLoading ||
          masterFranchiseeRoyaltyLoading ||
          royaltyPaymentSummaryPDFLoading ? (
            <div className="min-h-[61vh] min-w-[840px] shimmer-animation flex justify-center items-center">
              Loading...
            </div>
          ) : pdfFileURL ? (
            <div className="w-full min-w-full overflow-y-auto p-1">
              <Document
                file={pdfFileURL}
                onLoadSuccess={onDocumentLoadSuccess}
                className={
                  "w-full min-w-full flex justify-center flex-col max-h-[inherit]"
                }
                loading={
                  <div className="min-h-[61vh] min-w-[840px] flex justify-center items-center">
                    Loading...
                  </div>
                }
                error={() => {
                  setFileLoading(false);
                  return (
                    <div className="min-h-[61vh] min-w-[840px] flex justify-center items-center">
                      No data found.
                    </div>
                  );
                }}
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <div
                    key={`page_${index + 1}`}
                    className={"rounded-[10px] w-full"}
                  >
                    <Page pageNumber={index + 1} />
                  </div>
                ))}
              </Document>
            </div>
          ) : (
            <div className="min-h-[61vh] min-w-[840px] flex justify-center items-center">
              No data found.
            </div>
          )}

          {fileLoading ||
          hqRoyaltyLoading ||
          masterFranchiseeRoyaltyLoading ||
          royaltyPaymentSummaryPDFLoading ? null : (
            <div className="p-6 flex justify-end gap-2 whitespace-nowrap">
              {pdfModal?.modalFrom === "Paid" && (
                <Button
                  className="w-min shadow-none"
                  variant="outlined"
                  onPress={onSendReceiptHandler}
                  loading={
                    sendHQRoyaltyReceiptMailLoading ||
                    sendMasterFranchiseeRoyaltyReceiptMailLoading
                  }
                >
                  SEND RECEIPT
                </Button>
              )}
              <Button
                className={combineClassName(
                  "w-min whitespace-nowrap",
                  pdfModal?.modalFrom === "Paid"
                    ? ""
                    : "bg-none bg-primary-main"
                )}
                onPress={
                  pdfModal?.modalFrom === "Paid" ||
                  pdfModal?.modalFrom === "Download PDF"
                    ? onDownloadHandler
                    : onSendInvoiceHandler
                }
                loading={
                  sendHQRoyaltyInvoiceMailLoading ||
                  sendMasterFranchiseeRoyaltyInvoiceMailLoading
                }
              >
                {pdfModal?.modalFrom === "Paid" ||
                pdfModal?.modalFrom === "Download PDF"
                  ? "DOWNLOAD"
                  : "SEND INVOICE"}
              </Button>
            </div>
          )}
        </Modal>
      ) : null}
    </Fragment>
  );
};

export default PDFShowing;
