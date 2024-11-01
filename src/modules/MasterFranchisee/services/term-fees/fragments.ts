import { gql } from "@apollo/client";

const MASTER_FRANCHISEE_TERM_FEES_FRAGMENT = gql`
  fragment masterFranchiseeTermFeeFragment on MasterFranchiseeEducationalTerm {
    id
    price @include(if: $isMasterFranchiseeTermFeePriceNeed)
    educationalTerm
      @include(if: $isMasterFranchiseeTermFeeEducationalTermNeed) {
      id
      name
      country {
        id
        name
      }
      remarks
      workbookInformation
        @include(if: $isMasterFranchiseeTermFeeEducationalTermWorkbookNeed) {
        id
        name
      }
    }
  }
`;

export { MASTER_FRANCHISEE_TERM_FEES_FRAGMENT };
