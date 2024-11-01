import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterMasterFranchiseeWorkBookFeesArgs,
  FilterMasterFranchiseeWorkBookFeesResponse,
  MASTER_FRANCHISEE_WORK_BOOK_FEES_FRAGMENT,
} from "modules/MasterFranchisee";

const FILTER_MASTER_FRANCHISEE_WORK_BOOK_FEES: TypedDocumentNode<
  FilterMasterFranchiseeWorkBookFeesResponse,
  FilterMasterFranchiseeWorkBookFeesArgs
> = gql`
  ${MASTER_FRANCHISEE_WORK_BOOK_FEES_FRAGMENT}
  ${PAGINATION_INFO_FRAGMENT}
  query FilterMasterFranchiseeWorkBookFees(
    $filter: MasterFranchiseeWorkBookFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isMasterFranchiseeWorkBookFeePriceNeed: Boolean = false
    $isMasterFranchiseeWorkBookFeeWorkBookInformationNeed: Boolean = false
  ) {
    filterMasterFranchiseeWorkBookFees: filterMasterFranchiseeWorkBook(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...masterFranchiseeWorkBookFeeFragment
        }
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_MASTER_FRANCHISEE_WORK_BOOK_FEES };
