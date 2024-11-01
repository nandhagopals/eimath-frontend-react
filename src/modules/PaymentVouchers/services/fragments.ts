import { gql } from "@apollo/client";

const PAYMENT_VOUCHER_FRAGMENT = gql`
  fragment paymentVoucherFragment on Payment {
    id
    payee @include(if: $isPayeeNeed)
    date @include(if: $isDateNeed)
    amount @include(if: $isAmountNeed)
    description @include(if: $isDescriptionNeed)
    remarks @include(if: $isRemarksNeed)
    status @include(if: $isStatusNeed)
  }
`;

export { PAYMENT_VOUCHER_FRAGMENT };
