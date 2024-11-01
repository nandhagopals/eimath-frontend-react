import { gql } from "@apollo/client";

const TEACHERS_FRAGMENT = gql`
  fragment teachersFragment on Teacher {
    id
    name
    email @include(if: $isEmailNeed)
    isdCode @include(if: $isISDCodeNeed)
    mobileNumber @include(if: $isMobileNumberNeed)
    country @include(if: $isCountryNeed) {
      id
      isdCode
    }
    masterFranchiseeInformation
      @include(if: $isMasterFranchiseeInformationNeed) {
      id
      masterFranchiseeName
    }
    franchiseeInformation @include(if: $isFranchiseInformationNeed) {
      id
      franchiseeName
    }
    status @include(if: $isStatusNeed)
    joinDate @include(if: $isJoinDateNeed)
  }
`;

export { TEACHERS_FRAGMENT };
