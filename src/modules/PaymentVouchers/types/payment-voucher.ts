import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  DateTime,
  FilterDate,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

type PaymentVoucher = Nullish<{
  id: number;
  payee: string;
  date: DateTime;
  amount: number;
  description: string;
  remarks: string;
}>;

type PaymentVoucherFieldArgs = Nullish<{
  isPayeeNeed: boolean;
  isDateNeed: boolean;
  isAmountNeed: boolean;
  isDescriptionNeed: boolean;
  isRemarksNeed: boolean;
}>;

type PaymentVoucherFilterInput = Nullish<{
  id: FilterInteger;
  payee: FilterString;
  date: FilterDate;
  amount: FilterInteger;
  status: FilterString;
}>;

type FilterPaymentVoucherResponse = Nullish<{
  filterPaymentVouchers: CursorPaginationReturnType<PaymentVoucher>;
}>;

type FilterPaymentVouchersArgs = CursorPaginationArgs<
  PaymentVoucherFilterInput,
  "id" | "payee" | "date" | "amount"
> &
  PaymentVoucherFieldArgs;

type DeletePaymentVoucherResponse = Nullish<{
  deletePaymentVoucher: string;
}>;

interface DeletePaymentVoucherArgs {
  id: number;
}

interface GeneratePaymentVoucherPDFResponse {
  generatePaymentVoucherPdf: Nullish<{
    filePath: string;
    fileName: string;
  }>;
}

interface GeneratePaymentVoucherPDFArgs {
  paymentVoucherId: number;
}
export type {
  PaymentVoucher,
  PaymentVoucherFieldArgs,
  PaymentVoucherFilterInput,
  FilterPaymentVoucherResponse,
  FilterPaymentVouchersArgs,
  DeletePaymentVoucherResponse,
  DeletePaymentVoucherArgs,
  GeneratePaymentVoucherPDFResponse,
  GeneratePaymentVoucherPDFArgs,
};
