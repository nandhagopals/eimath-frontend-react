import { TypedDocumentNode, gql } from "@apollo/client";

import {
  GetInvoicePaymentMethodResponse,
  GetInvoiceTypeResponse,
} from "modules/Sales";
import {
  GenerateInvoiceReceiptPDFArgs,
  GenerateReceiptPdfResponse,
} from "modules/Students";

const GET_INVOICE_PAYMENT_METHOD: TypedDocumentNode<GetInvoicePaymentMethodResponse> = gql`
  query GetInvoicePaymentMethod {
    getInvoicePaymentMethod
  }
`;

const GENERATE_RECEIPT_PDF: TypedDocumentNode<
  GenerateReceiptPdfResponse,
  GenerateInvoiceReceiptPDFArgs
> = gql`
  query GenerateReceiptPdf($invoiceId: Int!) {
    generateReceiptPdf(invoiceId: $invoiceId) {
      fileName
      filePath
    }
  }
`;

const GET_INVOICE_TYPES: TypedDocumentNode<GetInvoiceTypeResponse> = gql`
  query GetInvoiceTypes {
    getInvoiceType
  }
`;

export { GET_INVOICE_PAYMENT_METHOD, GENERATE_RECEIPT_PDF, GET_INVOICE_TYPES };
