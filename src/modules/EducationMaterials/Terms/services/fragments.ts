import { gql } from "@apollo/client";

const EDUCATIONAL_TERM_FRAGMENT = gql`
  fragment educationalTermFragment on EducationalTerm {
    id
    name
    price @include(if: $isPriceNeed)
    country @include(if: $isCountryDetailsNeed) {
      id
      name
      status
    }
    status @include(if: $isStatusNeed)
    remarks @include(if: $isRemarksNeed)
    workbookInformation @include(if: $isWorkBookInformationNeed) {
      id
      name
      status
    }
  }
`;

export { EDUCATIONAL_TERM_FRAGMENT };
