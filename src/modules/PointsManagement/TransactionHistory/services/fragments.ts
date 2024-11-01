import { gql } from "@apollo/client";

const MASTER_FRANCHISEE_POINTS_TRANSACTION_FRAGMENT = gql`
  fragment masterFranchiseePointsTransactionFragment on MasterFranchiseePointsTransaction {
    id
    transactionId
    type @include(if: $isTypeNeed)
    points @include(if: $isPointsNeed)
    createdAt @include(if: $isCreatedAtNeed)
    remarks @include(if: $isRemarksNeed)
    masterFranchiseePoint @include(if: $isMasterFranchiseePointNeed) {
      id
      pointsAvailable
      masterFranchiseeInformation {
        prefix
      }
    }
  }
`;

export { MASTER_FRANCHISEE_POINTS_TRANSACTION_FRAGMENT };
