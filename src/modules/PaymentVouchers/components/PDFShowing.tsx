import { FC, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "@tanstack/react-router";

import CloseIcon from "global/assets/images/close-filled.svg?react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

import { Modal } from "components/Modal";
import { Button } from "components/Buttons";
import { Tooltip } from "components/Tooltip";
import { ConfirmModal } from "components/Modal";
import { Loading } from "components/Loading";

import { SetState } from "global/types";
import { toastNotification } from "global/cache";
import { fileDownload, messageHelper } from "global/helpers";

import {
  DELETE_PAYMENT_VOUCHER,
  GENERATE_PAYMENT_VOUCHER_PDF,
  ShowPDF,
  UPDATE_PAYMENT_VOUCHER,
} from "modules/PaymentVouchers";

interface Props {
  isOpen: boolean;
  setPDFModal: SetState<ShowPDF>;
  pdfModal: ShowPDF;
  modalFrom: "List" | "Form";
}

const PDFShowing: FC<Props> = ({
  isOpen,
  setPDFModal,
  pdfModal,
  modalFrom,
}) => {
  const navigate = useNavigate();
  const [fileLoading, setFileLoading] = useState(true);

  const { data, loading: paymentVoucherPDFLoading } = useQuery(
    GENERATE_PAYMENT_VOUCHER_PDF,
    {
      skip:
        pdfModal?.paymentVoucherId &&
        Number.isFinite(+pdfModal?.paymentVoucherId)
          ? false
          : true,
      variables: {
        paymentVoucherId: Number(pdfModal?.paymentVoucherId),
      },
      onCompleted: (data) => {
        if (
          data?.generatePaymentVoucherPdf &&
          pdfModal?.paymentVoucherId &&
          Number.isFinite(+pdfModal?.paymentVoucherId)
        ) {
          setPDFModal((prev) => ({
            showPDF: true,
            paymentVoucherId: pdfModal?.paymentVoucherId,
            isViewing: prev?.isViewing,
          }));
        } else {
          toastNotification([
            {
              message: "Something went wrong.",
              messageType: "error",
            },
          ]);
        }
      },
      onError: (error) => {
        toastNotification(
          messageHelper({
            type: "success",
            message: error?.message,
          })
        );
      },
    }
  );

  const [updatePaymentVoucher, { loading: updateLoading }] = useMutation(
    UPDATE_PAYMENT_VOUCHER
  );

  const [deletePaymentVoucher, { loading: deleteLoading }] = useMutation(
    DELETE_PAYMENT_VOUCHER
  );

  const [numPages, setNumPages] = useState<number>();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const confirmModalHandler = () => {
    setShowConfirmModal((prev) => !prev);
  };

  const onDocumentLoadSuccess = ({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void => {
    setNumPages(nextNumPages);
    setFileLoading(false);
  };
  const onCancelHandler = () => {
    if (modalFrom === "List") {
      setPDFModal({
        showPDF: false,
        paymentVoucherId: null,
      });
    } else {
      if (pdfModal?.paymentVoucherId) {
        deletePaymentVoucher({
          variables: {
            id: +pdfModal?.paymentVoucherId,
          },
        }).finally(() => {
          setPDFModal({
            showPDF: false,
            paymentVoucherId: null,
          });
        });
      }
    }
  };

  const onCreateHandler = () => {
    pdfModal?.paymentVoucherId &&
      updatePaymentVoucher({
        variables: {
          id: pdfModal?.paymentVoucherId,
          status: "Confirmed",
        },
      })
        .then(({ data }) => {
          if (data?.updatePaymentVoucher?.id) {
            navigate({
              to: "/payment-vouchers",
            });
          } else {
            toastNotification([
              {
                message: "Something went wrong.",
                messageType: "error",
              },
            ]);
          }
        })
        .catch((error) => {
          toastNotification(messageHelper(error));
        });
  };

  const onDownloadHandler = () => {
    fileDownload(data?.generatePaymentVoucherPdf?.filePath);
  };

  return isOpen ? (
    <Modal
      isOpen={isOpen}
      onClose={onCancelHandler}
      name="PDF Render"
      className="min-h-[80vh] max-h-[85vh] overflow-y-auto rounded-2xl space-y-2.5"
    >
      {paymentVoucherPDFLoading ? (
        <div className="min-h-[61vh] min-w-[905px] flex justify-center items-center">
          Loading...
        </div>
      ) : data?.generatePaymentVoucherPdf?.filePath ? (
        <Document
          file={data?.generatePaymentVoucherPdf?.filePath}
          onLoadSuccess={onDocumentLoadSuccess}
          className={"flex justify-center flex-col"}
          loading={
            <div className="min-h-[61vh] min-w-[905px] flex justify-center items-center">
              Loading...
            </div>
          }
          error={() => {
            setFileLoading(false);

            return (
              <div className="min-h-[61vh] min-w-[905px] flex justify-center items-center">
                No data found.
              </div>
            );
          }}
        >
          {Array.from(new Array(numPages), (_, index) => (
            <div
              key={`page_${index + 1}`}
              className={"rounded-[10px] overflow-x-auto p-8 min-w-[905px]"}
            >
              <div className="flex justify-end gap-2">
                {deleteLoading ? (
                  <Loading smallLoading color="primary" />
                ) : (
                  <Tooltip
                    renderer={"Close"}
                    isArrow
                    triggerProps={{
                      onPress: onCancelHandler,
                      className: "text-secondary-text focus:outline-none",
                    }}
                  >
                    <CloseIcon />
                  </Tooltip>
                )}
              </div>
              <Page pageNumber={index + 1} />
            </div>
          ))}
        </Document>
      ) : (
        <div className="min-h-[61vh] min-w-[905px] flex justify-center items-center">
          No data found.
        </div>
      )}

      {fileLoading ||
      paymentVoucherPDFLoading ? null : pdfModal?.isViewing ? null : (
        <div className="p-8 flex justify-center md:justify-end gap-2">
          {modalFrom === "Form" && (
            <Button
              className={
                "w-min bg-secondary-button hover:bg-secondary-button-hover border-transparent text-primary-text shadow-elevation"
              }
              variant="outlined"
              onPress={onCancelHandler}
              loading={deleteLoading}
              isDisabled={deleteLoading}
            >
              CANCEL
            </Button>
          )}
          <Button
            className={"w-min"}
            onPress={
              modalFrom === "List" ? onDownloadHandler : confirmModalHandler
            }
          >
            {modalFrom === "List" ? "DOWNLOAD" : "CREATE"}
          </Button>
        </div>
      )}
      <ConfirmModal
        message={`Confirm Create?`}
        onClose={confirmModalHandler}
        button={{
          primary: {
            loading: updateLoading,
            type: "button",
            onPress: onCreateHandler,
          },
          secondary: {
            isDisabled: updateLoading,
          },
        }}
        isOpen={showConfirmModal}
        loading={updateLoading}
      />
    </Modal>
  ) : null;
};

export default PDFShowing;
