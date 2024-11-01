import { z } from "zod";

import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  DateTime,
  FilterDate,
  FilterInteger,
  FilterString,
  Nullish,
  PDF,
} from "global/types";

import {
  Student,
  StudentInvoiceDiscount,
  studentBillingSchema,
} from "modules/Students";
import { Product } from "modules/Products";
import { InvoicePaymentMethod } from "modules/Sales";
import { WorkbookInformation } from "modules/EducationMaterials/WorkbookManagement";
import { EducationalTerm } from "modules/EducationMaterials/Terms";
import { Franchisee } from "modules/Franchisee";
import { MasterFranchiseeInformation } from "modules/MasterFranchisee";

type InvoiceStatus =
  | "Paid"
  | "Unpaid"
  | "Canceled"
  | "Refund"
  | "Pending"
  | "Deleted";

type InvoiceItem = Nullish<{
  id: number;
  itemName: string;
  unitPrice: number;
  price: number;
  quantity: number;
  item: Product;
  workbookInformation: WorkbookInformation;
  educationalTerm: EducationalTerm;
}>;

type Invoice = Nullish<{
  id: number;
  student: Student;
  orderingPartyStudent: Student;
  orderingPartyFranchisee: Franchisee;
  orderingPartyMF: MasterFranchiseeInformation;
  orderingPartyName: string;
  orderingPartyEmail: string;
  total: number;
  remarks: string;
  invoiceItems: InvoiceItem[];
  invoiceDiscounts: StudentInvoiceDiscount[];
  status: InvoiceStatus;
  subtotal: number;
  gstAmount: number;
  hasDiscount: boolean;
  invoiceId: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  discountAmount: number;
  paymentMethod: InvoicePaymentMethod;
  category: string;
  receiptId: string;
  invoiceFileURL: string;
  type: string;
}>;

type InvoiceFieldArgs = Nullish<{
  isInvoiceStudentNeed: boolean;
  isInvoiceInvoiceItemsNeed: boolean;
  isInvoiceTotalNeed: boolean;
  isInvoiceRemarksNeed: boolean;
  isInvoiceInvoiceDiscountsNeed: boolean;
  isInvoiceSubtotalNeed: boolean;
  isInvoiceGSTAmountNeed: boolean;
  isInvoiceOrderingPartyNameNeed: boolean;
  isInvoiceOrderingPartyStudentNeed: boolean;
  isInvoiceOrderingPartyFranchiseeNeed: boolean;
  isInvoiceOrderingPartyMFNeed: boolean;
  isInvoiceOrderingPartyEmailNeed: boolean;
  isInvoiceInvoiceIdNeed: boolean;
  isInvoiceCreatedAtNeed: boolean;
  isInvoiceUpdatedAtNeed: boolean;
  isInvoiceStatusNeed: boolean;
  isInvoicePaymentMethodNeed: boolean;
  isInvoiceCategoryNeed: boolean;
  isInvoiceReceiptIdNeed: boolean;
  isInvoiceInvoiceFileURLNeed: boolean;
  isInvoiceHasDiscountNeed: boolean;
  isInvoiceTypeNeed: boolean;
}>;

type InvoiceFilterInput = Nullish<{
  id: FilterInteger;
  category: FilterString;
  studentId: FilterInteger;
  status: FilterString;
  date: FilterDate;
  type: FilterString;
  mfScreen: String;
}>;

type FilterInvoicesResponse = Nullish<{
  filterInvoices: CursorPaginationReturnType<Invoice>;
}>;

type FilterInvoicesArgs = CursorPaginationArgs<
  InvoiceFilterInput,
  | "id"
  | "receiptId"
  | "receivingParty"
  | "createdAt"
  | "updatedAt"
  | "paymentMethod"
  | "type"
> &
  InvoiceFieldArgs;

type UpdateInvoiceResponse = Nullish<{
  updateInvoice: Invoice;
}>;

type UpdateInvoiceArgs = {
  id: number;
  orderingPartyEmail?: String | null;
  status?: InvoiceStatus;
  remarks?: string | null;
  paymentMethod?: InvoicePaymentMethod | null;
  invoiceItems?: {
    id?: number | null;
    itemId?: number | string | null;
    itemName?: string | null;
    unitPrice?: number | null;
    quantity?: number | null;
    workbookInformationId?: number | string | null;
    educationalTermId?: number | string | null;
  }[];
  invoiceDiscounts?:
    | {
        description?: string | null;
        discountAmount?: number | null;
        id?: number | null;
      }[]
    | null;
  hasDiscount?: boolean;
} & InvoiceFieldArgs;

type UpdateBulkInvoicePaidArgs = {
  invoiceIds: number[];
  paymentMethod: string;
};

type UpdateBulkInvoicePaidResponse = Nullish<string>;

type StudentBillingForm = z.infer<typeof studentBillingSchema>;

type GenerateInvoicePdfResponse = Nullish<{
  generateInvoicePdf: PDF;
}>;

type GenerateInvoiceReceiptPDFArgs = {
  invoiceId: number;
};

type GenerateReceiptPdfResponse = Nullish<{
  generateReceiptPdf: PDF;
}>;

export type {
  FilterInvoicesResponse,
  FilterInvoicesArgs,
  InvoiceFieldArgs,
  UpdateInvoiceResponse,
  UpdateInvoiceArgs,
  StudentBillingForm,
  GenerateInvoicePdfResponse,
  GenerateInvoiceReceiptPDFArgs,
  Invoice,
  GenerateReceiptPdfResponse,
  InvoiceStatus,
  UpdateBulkInvoicePaidArgs,
  UpdateBulkInvoicePaidResponse,
};
