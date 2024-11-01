import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterMasterFranchiseeProductFeesArgs,
  FilterMasterFranchiseeProductFeesResponse,
  MASTER_FRANCHISEE_PRODUCT_FEE_FRAGMENT,
} from "modules/MasterFranchisee";

const FILTER_MASTER_FRANCHISEE_PRODUCT_FEES: TypedDocumentNode<
  FilterMasterFranchiseeProductFeesResponse,
  FilterMasterFranchiseeProductFeesArgs
> = gql`
  ${MASTER_FRANCHISEE_PRODUCT_FEE_FRAGMENT}
  ${PAGINATION_INFO_FRAGMENT}
  query FilterMasterFranchiseeProductFees(
    $filter: MasterFranchiseeProductFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isMasterFranchiseeProductFeePriceNeed: Boolean = false
    $isMasterFranchiseeProductFeeProductNeed: Boolean = false
  ) {
    filterMasterFranchiseeProductFees: filterMasterFranchiseeProduct(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...masterFranchiseeProductFeeFragment
        }
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_MASTER_FRANCHISEE_PRODUCT_FEES };
