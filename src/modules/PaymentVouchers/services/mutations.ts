import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CreatePaymentVoucherArgs,
  CreatePaymentVoucherResponse,
  DeletePaymentVoucherArgs,
  DeletePaymentVoucherResponse,
  GeneratePaymentVoucherCSVResponse,
  PAYMENT_VOUCHER_FRAGMENT,
  UpdatePaymentVoucherArgs,
  UpdatePaymentVoucherResponse,
} from "modules/PaymentVouchers";

const CREATE_PAYMENT_VOUCHER: TypedDocumentNode<
  CreatePaymentVoucherResponse,
  CreatePaymentVoucherArgs
> = gql`
  ${PAYMENT_VOUCHER_FRAGMENT}
  mutation CreatePaymentVoucher(
    $payee: String!
    $date: String!
    $amount: Float!
    $description: String!
    $remarks: String
    $isPayeeNeed: Boolean = false
    $isDateNeed: Boolean = false
    $isAmountNeed: Boolean = false
    $isDescriptionNeed: Boolean = false
    $isRemarksNeed: Boolean = false
    $isStatusNeed: Boolean = false
  ) {
    createPaymentVoucher(
      payee: $payee
      date: $date
      amount: $amount
      description: $description
      remarks: $remarks
    ) {
      ...paymentVoucherFragment
    }
  }
`;

const UPDATE_PAYMENT_VOUCHER: TypedDocumentNode<
  UpdatePaymentVoucherResponse,
  UpdatePaymentVoucherArgs
> = gql`
  ${PAYMENT_VOUCHER_FRAGMENT}
  mutation UpdatePaymentVoucher(
    $id: Int!
    $status: String
    $isPayeeNeed: Boolean = false
    $isDateNeed: Boolean = false
    $isAmountNeed: Boolean = false
    $isDescriptionNeed: Boolean = false
    $isRemarksNeed: Boolean = false
    $isStatusNeed: Boolean = false
  ) {
    updatePaymentVoucher(id: $id, status: $status) {
      ...paymentVoucherFragment
    }
  }
`;

const DELETE_PAYMENT_VOUCHER: TypedDocumentNode<
  DeletePaymentVoucherResponse,
  DeletePaymentVoucherArgs
> = gql`
  mutation DeletePaymentVoucher($id: Int!) {
    deletePaymentVoucher(id: $id)
  }
`;

const GENERATE_PAYMENT_VOUCHER_CSV: TypedDocumentNode<GeneratePaymentVoucherCSVResponse> = gql`
  mutation GeneratePaymentVoucherCSV {
    generatePaymentVoucherCSV
  }
`;

export {
  CREATE_PAYMENT_VOUCHER,
  UPDATE_PAYMENT_VOUCHER,
  DELETE_PAYMENT_VOUCHER,
  GENERATE_PAYMENT_VOUCHER_CSV,
};
