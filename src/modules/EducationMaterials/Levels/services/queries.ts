import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterEducationalLevelsArgs,
  FilterEducationalLevelsResponse,
  EDUCATIONAL_LEVEL_FRAGMENT,
} from "modules/EducationMaterials/Levels";

const FILTER_EDUCATIONAL_LEVELS: TypedDocumentNode<
  FilterEducationalLevelsResponse,
  FilterEducationalLevelsArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${EDUCATIONAL_LEVEL_FRAGMENT}
  query FilterEducationalLevels(
    $filter: EducationalLevelFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isCountryDetailsNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isRemarksNeed: Boolean = false
    $isEducationalTermsNeed: Boolean = false
  ) {
    filterEducationalLevels(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...educationalLevelFragment
        }
        cursor
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_EDUCATIONAL_LEVELS };
