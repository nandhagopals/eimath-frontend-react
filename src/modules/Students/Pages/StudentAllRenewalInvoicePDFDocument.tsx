import { FC, useState } from "react";
import { Document, Page } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";

import { Tooltip } from "components/Tooltip";

import DeleteIcon from "global/assets/images/delete-forever-filled.svg?react";
import PencilIcon from "global/assets/images/pencil-filled.svg?react";
import { PDF, SetState } from "global/types";

import { Invoice } from "modules/Students/types";

interface Prop {
  invoiceData: {
    invoice: Invoice;
    invoiceFile: PDF;
  };
  setShowRenewalModalForm: SetState<{
    invoice: Invoice;
    studentId: number;
    masterFranchiseeId: number;
  } | null>;
  setShowConfirmModal: SetState<
    | {
        type: "remove";
        id: number;
      }
    | {
        type: "renew-term";
      }
    | null
  >;
  setFileLoading: SetState<boolean>;
}
const StudentAllRenewalInvoicePDFDocument: FC<Prop> = ({
  invoiceData,
  setShowRenewalModalForm,
  setShowConfirmModal,
  setFileLoading,
}) => {
  const [numPages, setNumPages] = useState<number>();

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
    setFileLoading(false);
  }

  return (
    <Document
      file={invoiceData?.invoiceFile?.filePath}
      onLoadSuccess={onDocumentLoadSuccess}
      className={"w-full min-w-full flex justify-center flex-col"}
      loading={
        <div className="min-h-[61vh] min-w-[670px] flex justify-center items-center">
          Loading...
        </div>
      }
      error={() => {
        setFileLoading(false);

        return (
          <div className="min-h-[61vh] min-w-[670px] flex justify-center items-center">
            No data found.
          </div>
        );
      }}
    >
      {Array.from(new Array(numPages), (_, index) => (
        <div
          key={`page_${index + 1}`}
          className={"shadow-gradient-elevation p-6 rounded-[10px]"}
        >
          {index == 0 ? (
            <div className="flex justify-end gap-2">
              <Tooltip
                renderer={"Edit"}
                isArrow
                triggerProps={{
                  onPress: () => {
                    setShowRenewalModalForm({
                      invoice: invoiceData?.invoice,
                      masterFranchiseeId:
                        invoiceData?.invoice?.student
                          ?.masterFranchiseeInformation?.id!,
                      studentId: invoiceData?.invoice?.student?.id!,
                    });
                  },
                  className:
                    "border-none shadow-none text-secondary-text w-10 h-10 flex justify-center items-center p-0 min-w-10 min-h-10 rounded-full hover:bg-action-hover focus-visible:bg-action-hover",
                }}
              >
                <PencilIcon />
              </Tooltip>
              <Tooltip
                renderer={"Remove"}
                isArrow
                triggerProps={{
                  onPress: () => {
                    setShowConfirmModal({
                      type: "remove",
                      id: invoiceData?.invoice?.id!,
                    });
                  },
                  className:
                    "border-none shadow-none text-secondary-text w-10 h-10 flex justify-center items-center p-0 min-w-10 min-h-10 rounded-full hover:bg-action-hover focus-visible:bg-action-hover",
                }}
              >
                <DeleteIcon />
              </Tooltip>
            </div>
          ) : null}
          <Page pageNumber={index + 1} />
        </div>
      ))}
    </Document>
  );
};

export default StudentAllRenewalInvoicePDFDocument;
