import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterMasterFranchiseeInformationArgs,
  FilterMasterFranchiseeInformationResponse,
  MASTER_FRANCHISEE_INFORMATION_FRAGMENT,
} from "modules/MasterFranchisee";

const FILTER_MASTER_FRANCHISEE_INFORMATION: TypedDocumentNode<
  FilterMasterFranchiseeInformationResponse,
  FilterMasterFranchiseeInformationArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${MASTER_FRANCHISEE_INFORMATION_FRAGMENT}

  query FilterMasterFranchiseeInformation(
    $filter: MasterFranchiseeInformationFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isMasterFranchiseeInformationOwnerNameNeed: Boolean = false
    $isMasterFranchiseeInformationOwnerEmailNeed: Boolean = false
    $isMasterFranchiseeInformationOwnerPasswordNeed: Boolean = false
    $isMasterFranchiseeInformationIsdCountryNeed: Boolean = false
    $isMasterFranchiseeInformationOwnerMobileNumberNeed: Boolean = false
    $isMasterFranchiseeInformationCurrencyCountryNeed: Boolean = false
    $isMasterFranchiseeInformationStatusNeed: Boolean = false
    $isMasterFranchiseeInformationPrefixNeed: Boolean = false
    $isMasterFranchiseeInformationCompanyNameNeed: Boolean = false
    $isMasterFranchiseeInformationCompanyUENNeed: Boolean = false
    $isMasterFranchiseeInformationRevenueRoyaltiesNeed: Boolean = false
    $isMasterFranchiseeInformationRoyaltiesFromFranchiseNeed: Boolean = false
    $isMasterFranchiseeInformationInSingaporeNeed: Boolean = false
    $isMasterFranchiseeInformationBankAccountNumberNeed: Boolean = false
    $isMasterFranchiseeInformationOwnerIsdCodeNeed: Boolean = false
    $isMasterFranchiseeInformationCurrencyNeed: Boolean = false
    $isMasterFranchiseeInformationEducationCategoryNeed: Boolean = false
    $isMasterFranchiseeInformationAddressNeed: Boolean = false
    $isMasterFranchiseeInformationPostalCodeNeed: Boolean = false
    $isMasterFranchiseeInformationPostalCountryNeed: Boolean = false
    $isMasterFranchiseeMasterFranchiseeProductNeed: Boolean = false
    $isMasterFranchiseeMasterFranchiseeWorkBookNeed: Boolean = false
    $isMasterFranchiseeMasterFranchiseeEducationalTermNeed: Boolean = false
    $isMasterFranchiseePricePerSGDNeed: Boolean = false
  ) {
    filterMasterFranchiseeInformation(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...masterFranchiseeInformationFragment
        }
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_MASTER_FRANCHISEE_INFORMATION };
