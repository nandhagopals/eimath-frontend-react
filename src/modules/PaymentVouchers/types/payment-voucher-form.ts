import { z } from "zod";

import { Nullish } from "global/types";

import {
  PaymentVoucher,
  PaymentVoucherFieldArgs,
  paymentVoucherFormSchema,
} from "modules/PaymentVouchers";

type CreatePaymentVoucherResponse = Nullish<{
  createPaymentVoucher: PaymentVoucher;
}>;

interface CreatePaymentVoucherArgs extends PaymentVoucherFieldArgs {
  payee: string;
  description: string;
  date: string;
  amount: number;
  remarks?: string | null;
}

type UpdatePaymentVoucherResponse = Nullish<{
  updatePaymentVoucher: PaymentVoucher;
}>;

interface UpdatePaymentVoucherArgs extends Partial<CreatePaymentVoucherArgs> {
  id: number;
  status?: string;
}

type PaymentVoucherForm = z.infer<typeof paymentVoucherFormSchema>;

interface GeneratePaymentVoucherCSVResponse {
  generatePaymentVoucherCSV: string;
}

interface ShowPDF {
  showPDF: boolean;
  paymentVoucherId?: number | null;
  isViewing?: boolean;
}

export type {
  CreatePaymentVoucherResponse,
  CreatePaymentVoucherArgs,
  UpdatePaymentVoucherResponse,
  UpdatePaymentVoucherArgs,
  PaymentVoucherForm,
  GeneratePaymentVoucherCSVResponse,
  ShowPDF,
};
