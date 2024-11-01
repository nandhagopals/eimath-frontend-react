import { gql } from "@apollo/client";

const STAFF_FRAGMENT = gql`
  fragment staffFragment on User {
    id
    name
    isdCode @include(if: $isStaffIsdCodeNeed)
    country @include(if: $isStaffCountryNeed) {
      id
      isdCode
    }
    mobileNumber @include(if: $isStaffMobileNumberNeed)
    email @include(if: $isStaffEmailNeed)
    dob @include(if: $isStaffDobNeed)
    status @include(if: $isStaffStatusNeed)
    gender @include(if: $isStaffGenderNeed)
    password @include(if: $isStaffPasswordNeed)
    roles @include(if: $isStaffRoleNeed) {
      id
      name
    }
  }
`;

export { STAFF_FRAGMENT };
