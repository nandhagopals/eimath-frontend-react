import { FC, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import type { PDFDocumentProxy } from "pdfjs-dist";

import { Button } from "components/Buttons";
import { Tooltip } from "components/Tooltip";
import { ConfirmModal, Modal } from "components/Modal";

import CancelIcon from "global/assets/images/close-filled.svg?react";
import { useMutation } from "@apollo/client";
import { UPDATE_INVOICE } from "../services";
import { toastNotification } from "global/cache";
import { messageHelper, somethingWentWrongMessage } from "global/helpers";
import { useNavigate } from "@tanstack/react-router";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

interface Props {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  invoiceId: number;
  studentId: number;
}

const InvoicePDF: FC<Props> = ({
  isOpen,
  onClose,
  url,
  invoiceId,
  studentId,
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

  const [showConfirmEnrollModal, setShowConfirmEnrollModal] = useState(false);

  const closeConfirmEnroll = () => {
    setShowConfirmEnrollModal(false);
  };

  const [updateMutation, { loading: updateLoading }] =
    useMutation(UPDATE_INVOICE);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      name="PDF Render"
      className="min-h-[80vh] max-h-[80vh] overflow-y-auto rounded-2xl p-6"
    >
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        className={"w-full min-w-full flex justify-center flex-col"}
        loading={
          <div className="min-h-[61vh] min-w-[610px] flex justify-center items-center">
            Loading...
          </div>
        }
        error={() => {
          setFileLoading(false);
          return (
            <div className="min-h-[61vh] min-w-[610px] flex justify-center items-center">
              No data found.
            </div>
          );
        }}
      >
        {Array.from(new Array(numPages), (_, index) => (
          <div key={`page_${index + 1}`} className={"rounded-[10px]"}>
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
            <Page pageNumber={index + 1} />
          </div>
        ))}
      </Document>
      {!fileLoading && (
        <div className="pt-8 flex justify-end gap-2">
          <Button
            variant="outlined"
            className={"w-min"}
            onPress={() => {
              navigate({
                to: "/students/$studentId",
                search: true as unknown as any,
                params: {
                  studentId,
                },
              });

              onClose();
            }}
          >
            BACK
          </Button>
          <Button
            className={"w-min"}
            onPress={() => {
              setShowConfirmEnrollModal(true);
            }}
          >
            CONFIRM
          </Button>
        </div>
      )}
      <ConfirmModal
        message={"Confirm Enroll Student?"}
        onClose={closeConfirmEnroll}
        button={{
          primary: {
            onPress: () => {
              updateMutation({
                variables: {
                  id: invoiceId,
                  status: "Pending",
                },
              })
                .then(({ data }) => {
                  if (data?.updateInvoice?.id) {
                    closeConfirmEnroll();
                    onClose();
                    navigate({
                      to: "/students",
                      search: true as unknown as any,
                    });
                  } else {
                    toastNotification(somethingWentWrongMessage);
                  }
                })
                .catch((err) => {
                  toastNotification(messageHelper(err));
                });
            },
            loading: updateLoading,
          },
          secondary: {
            isDisabled: updateLoading,
          },
        }}
        isOpen={showConfirmEnrollModal}
        loading={updateLoading}
      />
    </Modal>
  );
};

export default InvoicePDF;
