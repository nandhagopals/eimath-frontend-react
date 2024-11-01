import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterPaymentVoucherResponse,
  FilterPaymentVouchersArgs,
  GeneratePaymentVoucherPDFArgs,
  GeneratePaymentVoucherPDFResponse,
  PAYMENT_VOUCHER_FRAGMENT,
} from "modules/PaymentVouchers";

const FILTER_PAYMENT_VOUCHERS: TypedDocumentNode<
  FilterPaymentVoucherResponse,
  FilterPaymentVouchersArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${PAYMENT_VOUCHER_FRAGMENT}
  query FilterPaymentVouchers(
    $filter: PaymentVoucherFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isPayeeNeed: Boolean = false
    $isDateNeed: Boolean = false
    $isAmountNeed: Boolean = false
    $isDescriptionNeed: Boolean = false
    $isRemarksNeed: Boolean = false
    $isStatusNeed: Boolean = false
  ) {
    filterPaymentVouchers(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...paymentVoucherFragment
        }
        cursor
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

const GENERATE_PAYMENT_VOUCHER_PDF: TypedDocumentNode<
  GeneratePaymentVoucherPDFResponse,
  GeneratePaymentVoucherPDFArgs
> = gql`
  query GeneratePaymentVoucherPdf($paymentVoucherId: Int!) {
    generatePaymentVoucherPdf(paymentVoucherId: $paymentVoucherId) {
      filePath
    }
  }
`;

export { FILTER_PAYMENT_VOUCHERS, GENERATE_PAYMENT_VOUCHER_PDF };
