import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  EDUCATIONAL_CATEGORY_FRAGMENT,
  FilterEducationalCategoriesArgs,
  FilterEducationalCategoriesResponse,
} from "modules/EducationMaterials/EducationalCategory";

const FILTER_EDUCATIONAL_CATEGORIES: TypedDocumentNode<
  FilterEducationalCategoriesResponse,
  FilterEducationalCategoriesArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${EDUCATIONAL_CATEGORY_FRAGMENT}
  query FilterEducationalCategories(
    $filter: EducationalCategoryFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isEducationalCategoryCountryNeed: Boolean = false
    $isEducationalCategoryEducationalLevelsNeed: Boolean = false
    $isEducationalCategoryStatusNeed: Boolean = false
    $isEducationalCategoryRemarksNeed: Boolean = false
  ) {
    filterEducationalCategories(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      pageInfo {
        ...paginationInfoFragment
      }
      edges {
        node {
          ...educationalCategoryFragment
        }
      }
    }
  }
`;

export { FILTER_EDUCATIONAL_CATEGORIES };
