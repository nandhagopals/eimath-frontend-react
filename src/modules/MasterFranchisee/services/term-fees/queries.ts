import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterMasterFranchiseeTermFeesArgs,
  FilterMasterFranchiseeTermFeesResponse,
  MASTER_FRANCHISEE_TERM_FEES_FRAGMENT,
} from "modules/MasterFranchisee";

const FILTER_MASTER_FRANCHISEE_TERM_FEES: TypedDocumentNode<
  FilterMasterFranchiseeTermFeesResponse,
  FilterMasterFranchiseeTermFeesArgs
> = gql`
  ${MASTER_FRANCHISEE_TERM_FEES_FRAGMENT}
  ${PAGINATION_INFO_FRAGMENT}
  query FilterMasterFranchiseeTermFees(
    $filter: MasterFranchiseeTermFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isMasterFranchiseeTermFeePriceNeed: Boolean = false
    $isMasterFranchiseeTermFeeEducationalTermNeed: Boolean = false
    $isMasterFranchiseeTermFeeEducationalTermWorkbookNeed: Boolean = false
  ) {
    filterMasterFranchiseeTermFees: filterMasterFranchiseeEducationalTerm(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...masterFranchiseeTermFeeFragment
        }
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_MASTER_FRANCHISEE_TERM_FEES };
