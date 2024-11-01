import { gql } from "@apollo/client";

const HQ_ROYALTY_FRAGMENT = gql`
  fragment hqRoyaltyFragment on HQRoyalty {
    id
    masterFranchiseeInformation
      @include(if: $isHQRoyaltyMasterFranchiseeInformationNeed) {
      id
      masterFranchiseeName
      currency
      prefix
    }
    revenue @include(if: $isRevenueNeed)
    earning @include(if: $isEarningNeed)
    status @include(if: $isStatusNeed)
    month @include(if: $isMonthNeed)
    year @include(if: $isYearNeed)
    paymentId @include(if: $isPaymentIdNeed)
    receiptId @include(if: $isReceiptIdNeed)
    paymentSummaryURL @include(if: $isPaymentSummaryURLNeed)
    receiptURL @include(if: $isReceiptURLNeed)
  }
`;

const MASTER_FRANCHISEE_ROYALTY_FRAGMENT = gql`
  fragment masterFranchiseeRoyaltyFragment on MasterFranchiseeRoyalty {
    id
    franchiseeInformation
      @include(if: $isMasterFranchiseeRoyaltyFranchiseeInformationNeed) {
      franchiseeName
      prefix
      masterFranchiseeInformation {
        currency
      }
    }
    masterFranchiseeRoyaltyTransactions
      @include(
        if: $isMasterFranchiseeRoyaltyMasterFranchiseeRoyaltyTransactionsNeed
      ) {
      id
      month
      year
      revenue
    }
    revenue @include(if: $isRevenueNeed)
    earning @include(if: $isEarningNeed)
    status @include(if: $isStatusNeed)
    month @include(if: $isMonthNeed)
    year @include(if: $isYearNeed)
    paymentId @include(if: $isPaymentIdNeed)
    receiptId @include(if: $isReceiptIdNeed)
    paymentSummaryURL @include(if: $isPaymentSummaryURLNeed)
    receiptURL @include(if: $isReceiptURLNeed)
  }
`;

const MASTER_FRANCHISEE_ROYALTY_TRANSACTION_FRAGMENT = gql`
  fragment masterFranchiseeRoyaltyTransactionFragment on MasterFranchiseeRoyaltyTransaction {
    id
    month @include(if: $isMonthNeed)
    year @include(if: $isYearNeed)
    revenue @include(if: $isRevenueNeed)
    masterFranchiseeRoyalty @include(if: $isMasterFranchiseeRoyaltyNeed) {
      status
      franchiseeInformation {
        masterFranchiseeInformation {
          currency
          masterFranchiseeName
          prefix
        }
      }
    }
    student @include(if: $isStudentNeed) {
      id
      name
    }
  }
`;

export {
  HQ_ROYALTY_FRAGMENT,
  MASTER_FRANCHISEE_ROYALTY_FRAGMENT,
  MASTER_FRANCHISEE_ROYALTY_TRANSACTION_FRAGMENT,
};
