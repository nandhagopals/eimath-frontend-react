import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterMasterFranchiseePointsArgs,
  FilterMasterFranchiseePointsResponse,
  MASTER_FRANCHISEE_POINTS_FRAGMENT,
} from "modules/PointsManagement";

const FILTER_MASTER_FRANCHISEE_POINTS: TypedDocumentNode<
  FilterMasterFranchiseePointsResponse,
  FilterMasterFranchiseePointsArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${MASTER_FRANCHISEE_POINTS_FRAGMENT}
  query FilterMasterFranchiseePoints(
    $filter: MasterFranchiseePointFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isMasterFranchiseeInformationNeed: Boolean = false
    $isPointsAvailableNeed: Boolean = false
    $isUpdateAtNeed: Boolean = false
    $isMasterFranchiseePointsTransactionsNeed: Boolean = false
  ) {
    filterMasterFranchiseePoints(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...pointsFragment
        }
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_MASTER_FRANCHISEE_POINTS };
