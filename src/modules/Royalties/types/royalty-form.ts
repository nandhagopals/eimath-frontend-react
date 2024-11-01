import {
  HQRoyalty,
  HQRoyaltyFieldArgs,
  MasterFranchiseeRoyalty,
  MasterFranchiseeRoyaltyFieldArgs,
} from "modules/Royalties";

interface GenerateHQRoyaltyCSVResponse {
  generateHQRoyaltyCSV: string;
}

interface GenerateMasterFranchiseeRoyaltyCSVResponse {
  generateMasterFranchiseeRoyaltyCSV: string;
}

interface GenerateMasterFranchiseeRoyaltyByMFCSVResponse {
  generateMasterFranchiseeRoyaltyByMFCSV: string;
}

interface GenerateMasterFranchiseeRoyaltyTransactionCSVResponse {
  generateMasterFranchiseeRoyaltyTransactionCSV: string;
}

interface SendHQRoyaltyInvoiceMailResponse {
  sendHQRoyaltyInvoiceMail: string;
}

interface SendHQRoyaltyInvoiceMailArgs {
  hqRoyaltyId: number;
}

interface SendMasterFranchiseeRoyaltyInvoiceMailResponse {
  sendMasterFranchiseeRoyaltyInvoiceMail: string;
}

interface SendMasterFranchiseeRoyaltyInvoiceMailArg {
  mfRoyaltyId: number;
}

interface SendHQRoyaltyReceiptMailResponse {
  sendHQRoyaltyReceiptMail: string;
}
interface SendHQRoyaltyReceiptMailArgs {
  hqRoyaltyId: number;
}

interface SendMasterFranchiseeRoyaltyReceiptMailResponse {
  sendMasterFranchiseeRoyaltyReceiptMail: string;
}

interface SendMasterFranchiseeRoyaltyReceiptMailArgs {
  mfRoyaltyId: number;
}

interface ConfirmHQRoyaltyPaymentResponse {
  confirmHQRoyaltyPayment?: HQRoyalty | null;
}

type ConfirmHQRoyaltyPaymentArgs = HQRoyaltyFieldArgs & { id: number };

interface ConfirmMasterFranchiseeRoyaltyPaymentResponse {
  confirmMasterFranchiseeRoyaltyPayment?: MasterFranchiseeRoyalty | null;
}

type ConfirmMasterFranchiseeRoyaltyPaymentArgs =
  MasterFranchiseeRoyaltyFieldArgs & { id: number };

interface ShowPDF {
  showPDF: boolean;
  royaltyId: number;
  modalFrom:
    | "Paid"
    | "Send Invoice"
    | "View"
    | "Download PDF"
    | "Unpaid"
    | null;
}

export type {
  GenerateHQRoyaltyCSVResponse,
  GenerateMasterFranchiseeRoyaltyCSVResponse,
  GenerateMasterFranchiseeRoyaltyByMFCSVResponse,
  GenerateMasterFranchiseeRoyaltyTransactionCSVResponse,
  SendHQRoyaltyInvoiceMailResponse,
  SendMasterFranchiseeRoyaltyInvoiceMailResponse,
  SendHQRoyaltyReceiptMailResponse,
  SendMasterFranchiseeRoyaltyReceiptMailResponse,
  ConfirmHQRoyaltyPaymentArgs,
  ConfirmHQRoyaltyPaymentResponse,
  ShowPDF,
  SendHQRoyaltyReceiptMailArgs,
  SendHQRoyaltyInvoiceMailArgs,
  SendMasterFranchiseeRoyaltyInvoiceMailArg,
  SendMasterFranchiseeRoyaltyReceiptMailArgs,
  ConfirmMasterFranchiseeRoyaltyPaymentArgs,
  ConfirmMasterFranchiseeRoyaltyPaymentResponse,
};
