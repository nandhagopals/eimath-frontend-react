import { gql } from "@apollo/client";

const MASTER_FRANCHISEE_POINTS_FRAGMENT = gql`
  fragment pointsFragment on MasterFranchiseePoint {
    id
    masterFranchiseeInformation
      @include(if: $isMasterFranchiseeInformationNeed) {
      id
      masterFranchiseeName
    }
    masterFranchiseePointsTransactions
      @include(if: $isMasterFranchiseePointsTransactionsNeed) {
      id
      transactionId
      points
      type
    }
    pointsAvailable @include(if: $isPointsAvailableNeed)
    updatedAt @include(if: $isUpdateAtNeed)
  }
`;

export { MASTER_FRANCHISEE_POINTS_FRAGMENT };
