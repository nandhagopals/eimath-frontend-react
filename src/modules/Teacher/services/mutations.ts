import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CreateTeacherArgs,
  CreateTeacherResponse,
  DeleteTeacherArgs,
  DeleteTeacherResponse,
  GenerateTeacherCSVArgs,
  GenerateTeacherCSVResponse,
  TEACHERS_FRAGMENT,
  UpdateTeacherArgs,
  UpdateTeacherResponse,
} from "modules/Teacher";

const CREATE_TEACHER: TypedDocumentNode<
  CreateTeacherResponse,
  CreateTeacherArgs
> = gql`
  ${TEACHERS_FRAGMENT}
  mutation CreateTeacher(
    $masterFranchiseeInformationId: Int!
    $franchiseeInformationId: Int!
    $name: String!
    $email: String!
    $countryId: Int!
    $mobileNumber: String!
    $joinDate: String!
    $isEmailNeed: Boolean = false
    $isISDCodeNeed: Boolean = false
    $isMobileNumberNeed: Boolean = false
    $isFranchiseInformationNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isMasterFranchiseeInformationNeed: Boolean = false
    $isCountryNeed: Boolean = false
    $isJoinDateNeed: Boolean = false
  ) {
    createTeacher(
      masterFranchiseeInformationId: $masterFranchiseeInformationId
      franchiseeInformationId: $franchiseeInformationId
      name: $name
      email: $email
      countryId: $countryId
      mobileNumber: $mobileNumber
      joinDate: $joinDate
    ) {
      ...teachersFragment
    }
  }
`;

const UPDATE_TEACHER: TypedDocumentNode<
  UpdateTeacherResponse,
  UpdateTeacherArgs
> = gql`
  ${TEACHERS_FRAGMENT}
  mutation UpdateTeacher(
    $id: Int!
    $name: String
    $email: String
    $countryId: Int
    $mobileNumber: String
    $status: String
    $joinDate: String
    $isEmailNeed: Boolean = false
    $isISDCodeNeed: Boolean = false
    $isMobileNumberNeed: Boolean = false
    $isFranchiseInformationNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isMasterFranchiseeInformationNeed: Boolean = false
    $isCountryNeed: Boolean = false
    $isJoinDateNeed: Boolean = false
  ) {
    updateTeacher(
      id: $id
      name: $name
      email: $email
      countryId: $countryId
      mobileNumber: $mobileNumber
      status: $status
      joinDate: $joinDate
    ) {
      ...teachersFragment
    }
  }
`;

const DELETE_TEACHER: TypedDocumentNode<
  DeleteTeacherResponse,
  DeleteTeacherArgs
> = gql`
  mutation DeleteTeacher($id: Int!) {
    deleteTeacher(id: $id)
  }
`;

const GENERATE_TEACHER_CSV: TypedDocumentNode<
  GenerateTeacherCSVResponse,
  GenerateTeacherCSVArgs
> = gql`
  mutation GenerateTeacherCSV($status: String) {
    generateTeacherCSV(status: $status)
  }
`;

export { CREATE_TEACHER, UPDATE_TEACHER, DELETE_TEACHER, GENERATE_TEACHER_CSV };
