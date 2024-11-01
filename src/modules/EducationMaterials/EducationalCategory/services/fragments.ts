import { gql } from "@apollo/client";

const EDUCATIONAL_CATEGORY_FRAGMENT = gql`
  fragment educationalCategoryFragment on EducationalCategory {
    id
    name
    country @include(if: $isEducationalCategoryCountryNeed) {
      id
      name
      status
    }
    educationalCategoryLevels
      @include(if: $isEducationalCategoryEducationalLevelsNeed) {
      id
      educationalLevel {
        id
        name
        status
      }
      position
      isFinalTerm
    }
    status @include(if: $isEducationalCategoryStatusNeed)
    remarks @include(if: $isEducationalCategoryRemarksNeed)
  }
`;

export { EDUCATIONAL_CATEGORY_FRAGMENT };
