import { z } from "zod";

import { Nullish } from "global/types";

import { invoicePaymentMethodSchema, salesSortBySchema } from "modules/Sales";
import { Invoice } from "modules/Students";

type SalesSortBy = NonNullable<
  NonNullable<z.infer<typeof salesSortBySchema>>["column"]
>;

type GenerateSaleCSVResponse = Nullish<{
  generateInvoiceCSV: string;
}>;

interface GenerateSaleCSVArgs {
  mfScreen?: "HQ" | "Franchisee";
}

type InvoicePaymentMethod = z.infer<typeof invoicePaymentMethodSchema>;

interface GetInvoicePaymentMethodResponse {
  getInvoicePaymentMethod?: InvoicePaymentMethod[] | null;
}

interface GetInvoiceTypeResponse {
  getInvoiceType?: string[] | null;
}

type CreateInvoiceResponse = Nullish<{
  createInvoice: Invoice;
}>;

type CreateInvoiceArgs = {
  orderingPartyStudentId?: number | null;
  orderingPartyFranchiseeId?: number | null;
  orderingPartyMFId?: number | null;
  orderingPartyName?: string | null;
  orderingPartyEmail?: string | null;
  paymentMethod?: InvoicePaymentMethod | null;
  hasDiscount: boolean;
  remarks?: string | null;
  invoiceItems: {
    id?: number | null;
    itemId?: number | string | null;
    itemName?: string | null;
    price?: number | null;
    quantity?: number | null;
  }[];
};
type SendInvoiceMailResponse = Nullish<{
  sendInvoiceMail: string;
}>;
type SendReceiptMailResponse = Nullish<{
  sendInvoiceReceiptMail: string;
}>;

interface SendInvoiceMailArgs {
  invoiceId: number;
}
export type {
  SalesSortBy,
  GenerateSaleCSVResponse,
  GenerateSaleCSVArgs,
  GetInvoicePaymentMethodResponse,
  InvoicePaymentMethod,
  CreateInvoiceArgs,
  CreateInvoiceResponse,
  GetInvoiceTypeResponse,
  SendInvoiceMailResponse,
  SendInvoiceMailArgs,
  SendReceiptMailResponse,
};
