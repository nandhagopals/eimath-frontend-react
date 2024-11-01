import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FRANCHISEE_FRAGMENT,
  FilterFranchiseesArgs,
  FilterFranchiseesResponse,
} from "modules/Franchisee";

const FILTER_FRANCHISEES: TypedDocumentNode<
  FilterFranchiseesResponse,
  FilterFranchiseesArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${FRANCHISEE_FRAGMENT}
  query FilterFranchisees(
    $filter: FranchiseeInformationFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $franchiseeEducationalCategoryId: filterInteger
    $franchiseeEducationalCategoryStatus: filterString
    $franchiseeEducationalCategoryEducationalLevelId: filterInteger
    $franchiseeEducationalCategoryEducationalLevelStatus: filterString
    $franchiseeEducationalCategoryEducationalLevelEducationalTermId: filterInteger
    $franchiseeEducationalCategoryEducationalLevelEducationalTermStatus: filterString
    $isFranchiseeOwnerNameNeed: Boolean = false
    $isFranchiseeOwnerEmailNeed: Boolean = false
    $isFranchiseeOwnerIsdCodeNeed: Boolean = false
    $isFranchiseeOwnerMobileNumberNeed: Boolean = false
    $isFranchiseeOwnerHomeAddressNeed: Boolean = false
    $isFranchiseeStatusNeed: Boolean = false
    $isFranchiseePrefixNeed: Boolean = false
    $isFranchiseeCompanyUENNeed: Boolean = false
    $isFranchiseeBankAccountNumberNeed: Boolean = false
    $isFranchiseeCountryNeed: Boolean = false
    $isFranchiseePasswordNeed: Boolean = false
    $isFranchiseeAddressNeed: Boolean = false
    $isFranchiseePostalCodeNeed: Boolean = false
    $isFranchiseePostalCountryNeed: Boolean = false
    $isFranchiseeEducationalCategoriesNeed: Boolean = false
    $isFranchiseeFranchiseeCompanyNameNeed: Boolean = false
    $isFranchiseeMasterFranchiseeInformationNeed: Boolean = false
    $isFranchiseeEducationalCategoryEducationalLevelNeed: Boolean = false
    $isFranchiseeEducationalCategoryEducationalLevelEducationalTermNeed: Boolean = false
  ) {
    filterFranchisees: filterFranchiseeInformation(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...franchiseeFragment
        }
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_FRANCHISEES };
