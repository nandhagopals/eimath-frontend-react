import { gql } from "@apollo/client";

const EDUCATIONAL_LEVEL_FRAGMENT = gql`
  fragment educationalLevelFragment on EducationalLevel {
    id
    name
    country @include(if: $isCountryDetailsNeed) {
      id
      name
      status
    }
    status @include(if: $isStatusNeed)
    remarks @include(if: $isRemarksNeed)
    educationalLevelTerms @include(if: $isEducationalTermsNeed) {
      id
      educationalTerm {
        id
        name
        status
      }
      position
    }
  }
`;

export { EDUCATIONAL_LEVEL_FRAGMENT };
