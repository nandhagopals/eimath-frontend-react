import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterMasterFranchiseeGeneralsArgs,
  FilterMasterFranchiseeGeneralsResponse,
  MASTER_FRANCHISEE_GENERAL_FRAGMENT,
} from "modules/MasterFranchisee";

const FILTER_MASTER_FRANCHISEE_GENERALS: TypedDocumentNode<
  FilterMasterFranchiseeGeneralsResponse,
  FilterMasterFranchiseeGeneralsArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${MASTER_FRANCHISEE_GENERAL_FRAGMENT}
  query FilterMasterFranchiseeGenerals(
    $filter: MasterFranchiseeGeneralFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isMasterFranchiseeGeneralGSTPercentageNeed: Boolean = false
    $isMasterFranchiseeGeneralRegistrationFeeNeed: Boolean = false
    $isMasterFranchiseeGeneralDepositFeeNeed: Boolean = false
    $isMasterFranchiseeGeneralStaffEmailNeed: Boolean = false
    $isMasterFranchiseeGeneralStaffPasswordNeed: Boolean = false
    $isMasterFranchiseeGeneralEnableGSTNeed: Boolean = false
  ) {
    filterMasterFranchiseeGenerals(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...masterFranchiseeGeneralFragment
        }
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_MASTER_FRANCHISEE_GENERALS };
