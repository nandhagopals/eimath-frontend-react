import { FC, useState } from "react";
import { pdfjs } from "react-pdf";
import { ApolloQueryResult, useMutation, useQuery } from "@apollo/client";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Selection } from "react-aria-components";

import { Button } from "components/Buttons";
import { ConfirmModal, Modal } from "components/Modal";

import { toastNotification } from "global/cache";
import { CursorPaginationReturnType, PDF, SetState } from "global/types";
import {
  messageHelper,
  notEmpty,
  removeDuplicates,
  somethingWentWrongMessage,
} from "global/helpers";

import {
  RENEW_STUDENTS,
  Invoice,
  CONFIRM_STUDENT_RENEWAL_INVOICES,
  RenewStudentFieldArgs,
  FilterStudentsArgs,
  Student,
  FILTER_INVOICES,
} from "modules/Students";
import StudentRenewalFormModal from "modules/Students/Pages/StudentRenewalFormModal";
import StudentAllRenewalInvoicePDFDocument from "modules/Students/Pages/StudentAllRenewalInvoicePDFDocument";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const fieldArgs: RenewStudentFieldArgs = {
  isInvoiceInvoiceDiscountsNeed: true,
  isInvoiceInvoiceItemsNeed: true,
  isInvoiceRemarksNeed: true,
  isInvoiceStudentNeed: true,
  isInvoiceInvoiceIdNeed: true,
  isInvoiceOrderingPartyNameNeed: true,
  isRenewStudentInvoiceFileNeed: true,
  isInvoiceInvoiceFileURLNeed: true,
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentIds: number[];
  setSelectedKeys: SetState<Selection>;
  refetch: (variables?: Partial<FilterStudentsArgs> | undefined) => Promise<
    ApolloQueryResult<{
      filterStudents?: CursorPaginationReturnType<Student> | null | undefined;
    }>
  >;
}

const StudentAllRenewalInvoicePDF: FC<Props> = ({
  isOpen,
  onClose,
  studentIds,
  refetch,
  // setSelectedKeys,
}) => {
  const [fileLoading, setFileLoading] = useState(true);

  const [renewMutation, { loading }] = useMutation(RENEW_STUDENTS, {
    notifyOnNetworkStatusChange: true,
  });

  const [confirmRenewTerm, { loading: confirmRenewTermLoading }] = useMutation(
    CONFIRM_STUDENT_RENEWAL_INVOICES
  );

  const [responseData, setResponseData] = useState<
    | {
        invoice: Invoice;
        invoiceFile: PDF;
      }[]
    | null
  >(null);

  const [showConfirmModal, setShowConfirmModal] = useState<
    { type: "remove"; id: number } | { type: "renew-term" } | null
  >(null);

  const closeConfirmModal = () => {
    setShowConfirmModal(null);
  };

  const { loading: invoiceLoading, refetch: invoiceRefetch } = useQuery(
    FILTER_INVOICES,
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      variables: {
        filter: {
          studentId: {
            contains: studentIds,
          },
          category: {
            isExactly: "Renewal",
          },
          status: {
            isExactly: "Pending",
          },
        },
        ...fieldArgs,
        pagination: {
          size: 1,
        },
      },
      onCompleted: ({ filterInvoices }) => {
        if (filterInvoices?.edges && filterInvoices?.edges?.length > 0) {
          const invoiceStudentIds = removeDuplicates(
            filterInvoices?.edges
              ?.map((invoice) => invoice?.node?.student?.id)
              ?.filter(notEmpty) ?? []
          );

          const responseDataForInvoice =
            filterInvoices?.edges
              ?.map((edge) => {
                if (edge?.node) {
                  return {
                    invoice: edge?.node,
                    invoiceFile: {
                      fileName: "N/A",
                      filePath: edge?.node?.invoiceFileURL,
                    },
                  };
                } else null;
              })
              ?.filter(notEmpty) ?? [];

          if (invoiceStudentIds?.length !== studentIds?.length) {
            renewMutation({
              variables: {
                studentIds: studentIds?.filter(
                  (studentId) => !invoiceStudentIds?.includes(studentId)
                ),
                ...fieldArgs,
              },
            })
              .then(({ data }) => {
                if (data?.renewStudents) {
                  if (data?.renewStudents?.length > 0) {
                    setResponseData([
                      ...data?.renewStudents,
                      ...responseDataForInvoice,
                    ]);
                  } else {
                    setResponseData(responseDataForInvoice);
                  }
                } else {
                  toastNotification(somethingWentWrongMessage);
                }
              })
              .catch((err) => {
                toastNotification(messageHelper(err));
              });
          } else {
            setResponseData(responseDataForInvoice);
          }
        } else {
          renewMutation({
            variables: {
              studentIds: studentIds,
              ...fieldArgs,
            },
          })
            .then(({ data }) => {
              if (data?.renewStudents) {
                if (data?.renewStudents?.length > 0) {
                  setResponseData(data?.renewStudents);
                } else {
                  setResponseData(null);
                }
              } else {
                toastNotification(somethingWentWrongMessage);
              }
            })
            .catch((err) => {
              toastNotification(messageHelper(err));
            });
        }
      },
    }
  );

  const [showRenewalModalForm, setShowRenewalModalForm] = useState<{
    invoice: Invoice;
    studentId: number;
    masterFranchiseeId: number;
  } | null>(null);

  const showRenewalModalCloseHandler = () => {
    setShowRenewalModalForm(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      name="PDF Render"
      className="min-h-[80vh] max-h-[80vh] rounded-2xl flex justify-between flex-col"
    >
      {loading || invoiceLoading ? (
        <div className="min-h-[61vh] min-w-[710px] flex justify-center items-center transition-all">
          Loading...
        </div>
      ) : responseData && responseData?.length > 0 ? (
        <div className="max-h-[inherit] overflow-y-auto p-6 space-y-4">
          {responseData?.map((invoiceData, idx) => {
            return (
              <StudentAllRenewalInvoicePDFDocument
                key={idx}
                invoiceData={invoiceData}
                setFileLoading={setFileLoading}
                setShowRenewalModalForm={setShowRenewalModalForm}
                setShowConfirmModal={setShowConfirmModal}
              />
            );
          })}
        </div>
      ) : (
        <div className="min-h-[61vh] min-w-[710px] flex justify-center items-center">
          No data found.
        </div>
      )}
      {fileLoading || loading || invoiceLoading ? null : (
        <div className="flex justify-end gap-2 p-6">
          <Button
            className={
              "w-min bg-secondary-button hover:bg-secondary-button-hover border-transparent text-primary-text shadow-elevation"
            }
            variant="outlined"
            onPress={onClose}
          >
            CANCEL
          </Button>
          {responseData && responseData?.length > 0 ? (
            <Button
              className={"w-min"}
              onPress={() => {
                setShowConfirmModal({ type: "renew-term" });
              }}
              isDisabled={
                loading || (responseData && responseData?.length > 0)
                  ? false
                  : true
              }
            >
              CONFIRM
            </Button>
          ) : null}
        </div>
      )}
      {showConfirmModal?.type ? (
        <ConfirmModal
          message={
            showConfirmModal?.type === "renew-term"
              ? "Confirm Renew Term?"
              : "Confirm Remove?"
          }
          onClose={closeConfirmModal}
          button={{
            primary: {
              onPress: () => {
                if (showConfirmModal?.type === "renew-term") {
                  if (responseData && responseData?.length > 0) {
                    confirmRenewTerm({
                      variables: {
                        invoiceIds: responseData
                          ?.map((invoice) => invoice?.invoice?.id)
                          ?.filter(notEmpty),
                      },
                    })
                      .then(({ data }) => {
                        if (data?.confirmStudentRenewalInvoices) {
                          closeConfirmModal();
                          onClose();
                          refetch();
                        } else {
                          toastNotification(somethingWentWrongMessage);
                        }
                      })
                      .catch((err) => {
                        toastNotification(err);
                      });
                  } else {
                    toastNotification(somethingWentWrongMessage);
                  }
                } else {
                  if (showConfirmModal?.id)
                    setResponseData(
                      responseData?.filter(
                        (renewStudent) =>
                          renewStudent?.invoice?.id !== showConfirmModal?.id
                      ) ?? []
                    );
                  closeConfirmModal();
                }
              },
              loading: confirmRenewTermLoading,
            },
            secondary: {
              onPress: closeConfirmModal,
              isDisabled: confirmRenewTermLoading,
            },
          }}
          isOpen={!!showConfirmModal?.type}
        />
      ) : null}

      {showRenewalModalForm?.invoice?.id ? (
        <StudentRenewalFormModal
          invoice={showRenewalModalForm?.invoice}
          isOpen={!!showRenewalModalForm?.invoice?.id}
          onClose={showRenewalModalCloseHandler}
          masterFranchiseeId={showRenewalModalForm?.masterFranchiseeId}
          studentId={showRenewalModalForm?.studentId}
          invoiceRefetch={invoiceRefetch}
        />
      ) : null}
    </Modal>
  );
};

export default StudentAllRenewalInvoicePDF;
