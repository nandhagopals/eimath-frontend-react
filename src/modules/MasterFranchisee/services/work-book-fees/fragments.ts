import { gql } from "@apollo/client";

const MASTER_FRANCHISEE_WORK_BOOK_FEES_FRAGMENT = gql`
  fragment masterFranchiseeWorkBookFeeFragment on MasterFranchiseeWorkBook {
    id
    price @include(if: $isMasterFranchiseeWorkBookFeePriceNeed)
    workBookInformation: workbookInformation
      @include(if: $isMasterFranchiseeWorkBookFeeWorkBookInformationNeed) {
      id
      name
      country {
        id
        name
      }
      remarks
    }
    termInformation: educationalTerm
      @include(if: $isMasterFranchiseeWorkBookFeeWorkBookInformationNeed) {
      id
      name
      country {
        id
        name
      }
      remarks
    }
  }
`;

export { MASTER_FRANCHISEE_WORK_BOOK_FEES_FRAGMENT };
