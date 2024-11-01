import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterEducationalTermsArgs,
  FilterEducationalTermsResponse,
  EDUCATIONAL_TERM_FRAGMENT,
} from "modules/EducationMaterials/Terms";

const FILTER_EDUCATIONAL_TERMS: TypedDocumentNode<
  FilterEducationalTermsResponse,
  FilterEducationalTermsArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${EDUCATIONAL_TERM_FRAGMENT}
  query FilterEducationalTerms(
    $filter: EducationalTermFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isPriceNeed: Boolean = false
    $isCountryDetailsNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isRemarksNeed: Boolean = false
    $isWorkBookInformationNeed: Boolean = false
  ) {
    filterEducationalTerms(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...educationalTermFragment
        }
        cursor
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_EDUCATIONAL_TERMS };
