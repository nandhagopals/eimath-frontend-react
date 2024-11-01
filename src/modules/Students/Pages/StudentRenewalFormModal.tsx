import { FC } from "react";
import { useMutation } from "@apollo/client";

import { Modal } from "components/Modal";

import { toastNotification } from "global/cache";
import {
  messageHelper,
  notEmpty,
  somethingWentWrongMessage,
} from "global/helpers";
import { RefetchQueryType } from "global/types";

import { RenewalForm } from "modules/Students/Pages/StudentRenewalForm";
import {
  UPDATE_INVOICE,
  Invoice,
  InvoiceFieldArgs,
  FilterInvoicesResponse,
  FilterInvoicesArgs,
} from "modules/Students";

const fieldArgs: InvoiceFieldArgs = {
  isInvoiceInvoiceDiscountsNeed: true,
  isInvoiceInvoiceItemsNeed: true,
  isInvoiceRemarksNeed: true,
  isInvoiceStudentNeed: true,
  isInvoiceInvoiceIdNeed: true,
  isInvoiceOrderingPartyNameNeed: true,
  isInvoiceHasDiscountNeed: true,
  isInvoiceInvoiceFileURLNeed: true,
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  studentId: number;
  masterFranchiseeId: number;
  invoiceRefetch: RefetchQueryType<FilterInvoicesResponse, FilterInvoicesArgs>;
}

const StudentRenewalFormModal: FC<Props> = ({
  isOpen,
  onClose,
  invoice,
  masterFranchiseeId,
  studentId,
  invoiceRefetch,
}) => {
  const [updateMutation, { loading: updateLoading }] =
    useMutation(UPDATE_INVOICE);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={false}
      name="Renewal popup"
      className="overflow-y-auto max-w-[1000px] rounded-2xl p-6 lg:p-12 space-y-2.5 min-w-xs md:min-w-[500px] xl:min-w-[1000px]"
    >
      <RenewalForm
        type={"popup"}
        onSubmit={(
          {
            hasDiscount,
            discountAmountDiscountDescription,
            remarks,
            itemQuantityPrice,
            term,
          },
          invoiceId
        ) => {
          const educationalTerm = invoice?.invoiceItems?.filter(
            (item) => item?.educationalTerm?.id === term?.id
          )?.[0];

          const items =
            itemQuantityPrice
              ?.map((item) => {
                if (item?.quantity) {
                  return {
                    id: item?.id ?? undefined,
                    itemId:
                      typeof item?.item?.id === "number" &&
                      item?.item?.type === "product"
                        ? item?.item?.id
                        : undefined,
                    itemName:
                      typeof item?.item?.id === "string"
                        ? item?.item?.name
                        : undefined,
                    unitPrice: item?.price,
                    quantity: item?.quantity,
                    workbookInformationId:
                      typeof item?.item?.id === "number" &&
                      item?.item?.type === "workbook"
                        ? item?.item?.id
                        : undefined,
                    educationalTermId:
                      typeof item?.item?.id === "number" &&
                      item?.item?.type === "term"
                        ? item?.item?.id
                        : undefined,
                  };
                } else {
                  return null;
                }
              })
              ?.filter(notEmpty) ?? [];

          updateMutation({
            variables: {
              id: invoiceId,
              hasDiscount,
              invoiceDiscounts: hasDiscount
                ? discountAmountDiscountDescription
                    ?.map((discount) => {
                      if (discount?.amount) {
                        return {
                          id: discount?.id ?? undefined,
                          description: discount?.description,
                          discountAmount: discount?.amount,
                        };
                      } else {
                        return null;
                      }
                    })
                    ?.filter(notEmpty)
                : [],
              invoiceItems:
                educationalTerm && educationalTerm?.id
                  ? [
                      ...items,
                      {
                        id: educationalTerm?.id,
                        educationalTermId: educationalTerm?.educationalTerm?.id,
                        unitPrice: educationalTerm?.unitPrice,
                        quantity: educationalTerm?.quantity,
                      },
                    ]
                  : items,
              remarks,
              ...fieldArgs,
            },
          })
            .then(({ data }) => {
              if (data?.updateInvoice?.id) {
                invoiceRefetch();
                onClose();
              } else {
                toastNotification(somethingWentWrongMessage);
              }
            })
            .catch((err) => {
              toastNotification(messageHelper(err));
            });
        }}
        submitLoading={updateLoading}
        invoiceDetails={invoice}
        masterFranchiseeId={masterFranchiseeId}
        studentId={studentId}
        formLoading={false}
        onClose={onClose}
      />
    </Modal>
  );
};

export default StudentRenewalFormModal;
