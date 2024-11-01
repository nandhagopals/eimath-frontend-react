import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CreateInvoiceArgs,
  CreateInvoiceResponse,
  GenerateSaleCSVArgs,
  GenerateSaleCSVResponse,
  SendInvoiceMailArgs,
  SendInvoiceMailResponse,
  SendReceiptMailResponse,
} from "modules/Sales";
import { INVOICE_FRAGMENT } from "modules/Students";

const CREATE_INVOICE: TypedDocumentNode<
  CreateInvoiceResponse,
  CreateInvoiceArgs
> = gql`
  ${INVOICE_FRAGMENT}
  mutation CreateInvoice(
    $orderingPartyStudentId: Int
    $orderingPartyFranchiseeId: Int
    $orderingPartyMFId: Int
    $orderingPartyName: String
    $orderingPartyEmail: String
    $paymentMethod: String
    $hasDiscount: Boolean!
    $remarks: String
    $invoiceItems: [CreateInvoiceItems]!
    $invoiceDiscounts: [CreateInvoiceDiscount]
    $isInvoiceStudentNeed: Boolean = false
    $isInvoiceInvoiceItemsNeed: Boolean = false
    $isInvoiceTotalNeed: Boolean = false
    $isInvoiceRemarksNeed: Boolean = false
    $isInvoiceInvoiceDiscountsNeed: Boolean = false
    $isInvoiceSubtotalNeed: Boolean = false
    $isInvoiceGSTAmountNeed: Boolean = false
    $isInvoiceOrderingPartyNameNeed: Boolean = false
    $isInvoiceOrderingPartyStudentNeed: Boolean = false
    $isInvoiceOrderingPartyFranchiseeNeed: Boolean = false
    $isInvoiceOrderingPartyMFNeed: Boolean = false
    $isInvoiceOrderingPartyEmailNeed: Boolean = false
    $isInvoiceInvoiceIdNeed: Boolean = false
    $isInvoiceCreatedAtNeed: Boolean = false
    $isInvoiceUpdatedAtNeed: Boolean = false
    $isInvoiceStatusNeed: Boolean = false
    $isInvoiceDiscountAmountNeed: Boolean = false
    $isInvoicePaymentMethodNeed: Boolean = false
    $isInvoiceCategoryNeed: Boolean = false
    $isInvoiceReceiptIdNeed: Boolean = false
    $isInvoiceInvoiceFileURLNeed: Boolean = false
    $isInvoiceHasDiscountNeed: Boolean = false
    $isInvoiceTypeNeed: Boolean = false
  ) {
    createInvoice(
      orderingPartyStudentId: $orderingPartyStudentId
      orderingPartyFranchiseeId: $orderingPartyFranchiseeId
      orderingPartyMFId: $orderingPartyMFId
      orderingPartyName: $orderingPartyName
      orderingPartyEmail: $orderingPartyEmail
      paymentMethod: $paymentMethod
      hasDiscount: $hasDiscount
      remarks: $remarks
      invoiceItems: $invoiceItems
      invoiceDiscounts: $invoiceDiscounts
    ) {
      ...invoiceFragment
    }
  }
`;

const GENERATE_SALE_CSV: TypedDocumentNode<
  GenerateSaleCSVResponse,
  GenerateSaleCSVArgs
> = gql`
  mutation GenerateSaleCSV($mfScreen: String) {
    generateInvoiceCSV(mfScreen: $mfScreen)
  }
`;

const SEND_INVOICE_MAIL: TypedDocumentNode<
  SendInvoiceMailResponse,
  SendInvoiceMailArgs
> = gql`
  mutation SendInvoiceMail($invoiceId: Int!) {
    sendInvoiceMail(invoiceId: $invoiceId)
  }
`;

const SEND_RECEIPT_MAIL: TypedDocumentNode<
  SendReceiptMailResponse,
  SendInvoiceMailArgs
> = gql`
  mutation SendReceiptMail($invoiceId: Int!) {
    sendInvoiceReceiptMail(invoiceId: $invoiceId)
  }
`;

export {
  GENERATE_SALE_CSV,
  CREATE_INVOICE,
  SEND_INVOICE_MAIL,
  SEND_RECEIPT_MAIL,
};
