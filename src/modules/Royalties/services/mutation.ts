import { TypedDocumentNode, gql } from "@apollo/client";

import {
  GenerateHQRoyaltyCSVResponse,
  GenerateMasterFranchiseeRoyaltyCSVResponse,
  GenerateMasterFranchiseeRoyaltyByMFCSVResponse,
  GenerateMasterFranchiseeRoyaltyTransactionCSVResponse,
  SendHQRoyaltyInvoiceMailResponse,
  SendMasterFranchiseeRoyaltyInvoiceMailResponse,
  ConfirmHQRoyaltyPaymentResponse,
  ConfirmHQRoyaltyPaymentArgs,
  HQ_ROYALTY_FRAGMENT,
  SendHQRoyaltyReceiptMailResponse,
  SendMasterFranchiseeRoyaltyReceiptMailResponse,
  SendHQRoyaltyReceiptMailArgs,
  SendHQRoyaltyInvoiceMailArgs,
  SendMasterFranchiseeRoyaltyInvoiceMailArg,
  SendMasterFranchiseeRoyaltyReceiptMailArgs,
  MASTER_FRANCHISEE_ROYALTY_FRAGMENT,
  ConfirmMasterFranchiseeRoyaltyPaymentResponse,
  ConfirmMasterFranchiseeRoyaltyPaymentArgs,
} from "modules/Royalties";

const GENERATE_HQ_ROYALTY_CSV: TypedDocumentNode<GenerateHQRoyaltyCSVResponse> = gql`
  mutation GenerateHQRoyaltyCSV($status: String) {
    generateHQRoyaltyCSV(status: $status)
  }
`;

const GENERATE_MASTER_FRANCHISEE_ROYALTY_CSV: TypedDocumentNode<GenerateMasterFranchiseeRoyaltyCSVResponse> = gql`
  mutation GenerateMasterFranchiseeRoyaltyCSV($status: String) {
    generateMasterFranchiseeRoyaltyCSV(status: $status)
  }
`;

const GENERATE_MASTER_FRANCHISEE_ROYALTY_BY_MF_CSV: TypedDocumentNode<GenerateMasterFranchiseeRoyaltyByMFCSVResponse> = gql`
  mutation GenerateMasterFranchiseeRoyaltyByMFCSV($masterFranchiseeId: Int!) {
    generateMasterFranchiseeRoyaltyByMFCSV(
      masterFranchiseeId: $masterFranchiseeId
    )
  }
`;

const GENERATE_MASTER_FRANCHISEE_ROYALTY_TRANSACTION_CSV: TypedDocumentNode<GenerateMasterFranchiseeRoyaltyTransactionCSVResponse> = gql`
  mutation GenerateMasterFranchiseeRoyaltyTransactionCSV {
    generateMasterFranchiseeRoyaltyTransactionCSV
  }
`;

const SEND_HQ_ROYALTY_INVOICE_MAIL: TypedDocumentNode<
  SendHQRoyaltyInvoiceMailResponse,
  SendHQRoyaltyInvoiceMailArgs
> = gql`
  mutation SendHQRoyaltyInvoiceMail($hqRoyaltyId: Int!) {
    sendHQRoyaltyInvoiceMail(hqRoyaltyId: $hqRoyaltyId)
  }
`;

const SEND_MASTER_FRANCHISEE_ROYALTY_INVOICE_MAIL: TypedDocumentNode<
  SendMasterFranchiseeRoyaltyInvoiceMailResponse,
  SendMasterFranchiseeRoyaltyInvoiceMailArg
> = gql`
  mutation SendMasterFranchiseeRoyaltyInvoiceMail($mfRoyaltyId: Int!) {
    sendMasterFranchiseeRoyaltyInvoiceMail(mfRoyaltyId: $mfRoyaltyId)
  }
`;

const SEND_HQ_ROYALTY_RECEIPT_MAIL: TypedDocumentNode<
  SendHQRoyaltyReceiptMailResponse,
  SendHQRoyaltyReceiptMailArgs
> = gql`
  mutation SendHQRoyaltyReceiptMail($hqRoyaltyId: Int!) {
    sendHQRoyaltyReceiptMail(hqRoyaltyId: $hqRoyaltyId)
  }
`;

const SEND_MASTER_FRANCHISEE_ROYALTY_RECEIPT_MAIL: TypedDocumentNode<
  SendMasterFranchiseeRoyaltyReceiptMailResponse,
  SendMasterFranchiseeRoyaltyReceiptMailArgs
> = gql`
  mutation SendMasterFranchiseeRoyaltyReceiptMail($mfRoyaltyId: Int!) {
    sendMasterFranchiseeRoyaltyReceiptMail(mfRoyaltyId: $mfRoyaltyId)
  }
`;

const CONFIRM_HQ_ROYALTY_PAYMENT: TypedDocumentNode<
  ConfirmHQRoyaltyPaymentResponse,
  ConfirmHQRoyaltyPaymentArgs
> = gql`
  ${HQ_ROYALTY_FRAGMENT}
  mutation ConfirmHQRoyaltyPayment(
    $id: Int!
    $isHQRoyaltyMasterFranchiseeInformationNeed: Boolean = false
    $isRevenueNeed: Boolean = false
    $isEarningNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isMonthNeed: Boolean = false
    $isYearNeed: Boolean = false
    $isPaymentIdNeed: Boolean = false
    $isReceiptIdNeed: Boolean = false
    $isPaymentSummaryURLNeed: Boolean = false
    $isReceiptURLNeed: Boolean = false
  ) {
    confirmHQRoyaltyPayment(id: $id) {
      ...hqRoyaltyFragment
    }
  }
`;

const CONFIRM_MASTER_FRANCHISEE_ROYALTY_PAYMENT: TypedDocumentNode<
  ConfirmMasterFranchiseeRoyaltyPaymentResponse,
  ConfirmMasterFranchiseeRoyaltyPaymentArgs
> = gql`
  ${MASTER_FRANCHISEE_ROYALTY_FRAGMENT}
  mutation ConfirmMasterFranchiseeRoyaltyPayment(
    $id: Int!
    $isMasterFranchiseeRoyaltyFranchiseeInformationNeed: Boolean = false
    $isMasterFranchiseeRoyaltyMasterFranchiseeRoyaltyTransactionsNeed: Boolean = false
    $isRevenueNeed: Boolean = false
    $isEarningNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isMonthNeed: Boolean = false
    $isYearNeed: Boolean = false
    $isPaymentIdNeed: Boolean = false
    $isReceiptIdNeed: Boolean = false
    $isPaymentSummaryURLNeed: Boolean = false
    $isReceiptURLNeed: Boolean = false
  ) {
    confirmMasterFranchiseeRoyaltyPayment(id: $id) {
      ...masterFranchiseeRoyaltyFragment
    }
  }
`;

export {
  GENERATE_HQ_ROYALTY_CSV,
  GENERATE_MASTER_FRANCHISEE_ROYALTY_CSV,
  GENERATE_MASTER_FRANCHISEE_ROYALTY_BY_MF_CSV,
  GENERATE_MASTER_FRANCHISEE_ROYALTY_TRANSACTION_CSV,
  SEND_HQ_ROYALTY_INVOICE_MAIL,
  SEND_MASTER_FRANCHISEE_ROYALTY_INVOICE_MAIL,
  SEND_HQ_ROYALTY_RECEIPT_MAIL,
  SEND_MASTER_FRANCHISEE_ROYALTY_RECEIPT_MAIL,
  CONFIRM_HQ_ROYALTY_PAYMENT,
  CONFIRM_MASTER_FRANCHISEE_ROYALTY_PAYMENT,
};
