import { FC, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useMutation } from "@apollo/client";

import { Button } from "components/Buttons";
import { Tooltip } from "components/Tooltip";
import { Modal } from "components/Modal";

import CancelIcon from "global/assets/images/close-filled.svg?react";
import {
  combineClassName,
  fileDownload,
  messageHelper,
  somethingWentWrongMessage,
} from "global/helpers";
import { toastNotification } from "global/cache";

import { SEND_INVOICE_MAIL, SEND_RECEIPT_MAIL } from "modules/Sales/services";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

interface Props {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  fileType?: "INVOICE" | "RECEIPT";
  fileTypeId?: number;
}

const ViewInvoiceOrReceipt: FC<Props> = ({
  isOpen,
  onClose,
  url,
  fileType,
  fileTypeId,
}) => {
  const [numPages, setNumPages] = useState<number>();
  const [fileLoading, setFileLoading] = useState(true);

  const [sendInvoice, { loading: sendInvoiceLoading }] =
    useMutation(SEND_INVOICE_MAIL);

  const [sendReceipt, { loading: sendReceiptLoading }] =
    useMutation(SEND_RECEIPT_MAIL);

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
    setFileLoading(false);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      name="PDF Render"
      className="min-h-[80vh] max-h-[80vh] overflow-y-auto rounded-2xl py-4 px-6 flex flex-col"
    >
      <div className="flex justify-end gap-2">
        <Tooltip
          renderer={"Close"}
          isArrow
          triggerProps={{
            className: "text-secondary-text focus:outline-none",
          }}
        >
          <Button
            className={
              "border-none shadow-none text-secondary-text w-10 h-10 flex justify-center items-center p-0 min-w-10 min-h-10 rounded-full hover:bg-action-hover focus-visible:bg-action-hover"
            }
            variant="outlined"
            onPress={onClose}
          >
            <CancelIcon />
          </Button>
        </Tooltip>
      </div>
      <div className="w-full overflow-y-auto px-2">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          className={combineClassName(
            fileLoading
              ? "w-full min-w-[610px] flex justify-center flex-col"
              : "w-full min-w-full flex justify-center flex-col",
            "max-h-[inherit]"
          )}
          loading={
            <div className="min-h-[61vh] min-w-[610px] flex justify-center items-center">
              Loading...
            </div>
          }
          error={() => {
            setFileLoading(false);
            return (
              <div className="min-h-[61vh] min-w-[610px] flex justify-center items-center border border-outline-light rounded-md">
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
      {!fileLoading && url && (
        <div className="flex justify-end mt-2 gap-2 whitespace-nowrap">
          <Button
            className="w-min shadow-none"
            variant="outlined"
            onPress={() => {
              if (url) {
                fileDownload(url);
              } else {
                toastNotification(somethingWentWrongMessage);
              }
            }}
            isDisabled={fileLoading || !url}
          >
            DOWNLOAD
          </Button>
          {fileType && fileTypeId && (
            <Button
              className="w-min whitespace-nowrap"
              onPress={() => {
                if (fileType === "INVOICE" && fileTypeId) {
                  sendInvoice({
                    variables: {
                      invoiceId: fileTypeId,
                    },
                  })
                    .then(({ data }) => {
                      if (data?.sendInvoiceMail) {
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
                } else if (fileType === "RECEIPT" && fileTypeId) {
                  sendReceipt({
                    variables: {
                      invoiceId: fileTypeId,
                    },
                  })
                    .then(({ data }) => {
                      if (data?.sendInvoiceReceiptMail) {
                        toastNotification([
                          {
                            message: data?.sendInvoiceReceiptMail,
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
              }}
              loading={sendInvoiceLoading || sendReceiptLoading}
            >
              {`SEND ${fileType}`}
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ViewInvoiceOrReceipt;
