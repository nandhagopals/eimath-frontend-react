import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterMasterFranchiseePointsTransactionsArgs,
  FilterMasterFranchiseePointsTransactionsResponse,
  GetMFPointsPurchasePaymentMethodResponse,
  MASTER_FRANCHISEE_POINTS_TRANSACTION_FRAGMENT,
} from "modules/PointsManagement";

const FILTER_MASTER_FRANCHISEE_POINTS_TRANSACTIONS: TypedDocumentNode<
  FilterMasterFranchiseePointsTransactionsResponse,
  FilterMasterFranchiseePointsTransactionsArgs
> = gql`
  ${MASTER_FRANCHISEE_POINTS_TRANSACTION_FRAGMENT}
  ${PAGINATION_INFO_FRAGMENT}
  query FilterMasterFranchiseePointsTransactions(
    $filter: MasterFranchiseePointsTransactionFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $masterFranchiseeId: Int
    $isTypeNeed: Boolean = false
    $isPointsNeed: Boolean = false
    $isCreatedAtNeed: Boolean = false
    $isRemarksNeed: Boolean = false
    $isMasterFranchiseePointNeed: Boolean = false
  ) {
    filterMasterFranchiseePointsTransactions(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
      masterFranchiseeId: $masterFranchiseeId
    ) {
      edges {
        node {
          ...masterFranchiseePointsTransactionFragment
        }
        cursor
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

const GET_MF_POINT_PURCHASE_PAYMENT_METHOD: TypedDocumentNode<GetMFPointsPurchasePaymentMethodResponse> = gql`
  query GetMFPointsPurchasePaymentMethod {
    getMFPointsPurchasePaymentMethod
  }
`;
export {
  FILTER_MASTER_FRANCHISEE_POINTS_TRANSACTIONS,
  GET_MF_POINT_PURCHASE_PAYMENT_METHOD,
  
};
