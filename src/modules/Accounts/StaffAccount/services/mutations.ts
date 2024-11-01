import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CreateStaffArgs,
  CreateStaffResponse,
  STAFF_FRAGMENT,
  UpdateStaffArgs,
  UpdateStaffResponse,
} from "modules/Accounts/StaffAccount";

const CREATE_STAFF: TypedDocumentNode<
  CreateStaffResponse,
  CreateStaffArgs
> = gql`
  ${STAFF_FRAGMENT}
  mutation CreateStaff(
    $name: String!
    $gender: String!
    $email: String!
    $password: String!
    $countryId: Int!
    $mobileNumber: String!
    $roleId: Int!
    $isStaffIsdCodeNeed: Boolean = false
    $isStaffMobileNumberNeed: Boolean = false
    $isStaffEmailNeed: Boolean = false
    $isStaffDobNeed: Boolean = false
    $isStaffStatusNeed: Boolean = false
    $isStaffGenderNeed: Boolean = false
    $isStaffCountryNeed: Boolean = false
    $isStaffPasswordNeed: Boolean = false
    $isStaffRoleNeed: Boolean = false
  ) {
    createStaff: createUser(
      name: $name
      gender: $gender
      email: $email
      password: $password
      countryId: $countryId
      mobileNumber: $mobileNumber
      roleId: $roleId
    ) {
      ...staffFragment
    }
  }
`;

const UPDATE_STAFF: TypedDocumentNode<
  UpdateStaffResponse,
  UpdateStaffArgs
> = gql`
  ${STAFF_FRAGMENT}
  mutation UpdateStaff(
    $id: Int!
    $name: String
    $dob: String
    $gender: String
    $email: String
    $password: String
    $countryId: Int
    $status: String
    $mobileNumber: String
    $roleId: Int
    $isStaffIsdCodeNeed: Boolean = false
    $isStaffMobileNumberNeed: Boolean = false
    $isStaffEmailNeed: Boolean = false
    $isStaffDobNeed: Boolean = false
    $isStaffStatusNeed: Boolean = false
    $isStaffGenderNeed: Boolean = false
    $isStaffCountryNeed: Boolean = false
    $isStaffPasswordNeed: Boolean = false
    $isStaffRoleNeed: Boolean = false
  ) {
    updateStaff: updateUser(
      id: $id
      name: $name
      dob: $dob
      gender: $gender
      email: $email
      password: $password
      countryId: $countryId
      status: $status
      mobileNumber: $mobileNumber
      roleId: $roleId
    ) {
      ...staffFragment
    }
  }
`;

export { CREATE_STAFF, UPDATE_STAFF };
