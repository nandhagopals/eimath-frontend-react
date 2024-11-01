import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CreateFranchiseeArgs,
  CreateFranchiseeResponse,
  DeleteFranchiseeArgs,
  DeleteFranchiseeResponse,
  FRANCHISEE_FRAGMENT,
  GenerateFranchiseeCSVArgs,
  GenerateFranchiseeCSVResponse,
  UpdateFranchiseeArgs,
  UpdateFranchiseeResponse,
} from "modules/Franchisee";

const CREATE_FRANCHISEE: TypedDocumentNode<
  CreateFranchiseeResponse,
  CreateFranchiseeArgs
> = gql`
  ${FRANCHISEE_FRAGMENT}
  mutation CreateFranchisee(
    $masterFranchiseeInformationId: Int!
    $countryId: Int!
    $ownerName: String!
    $ownerEmail: String!
    $ownerMobileNumber: String!
    $prefix: String!
    $companyName: String!
    $companyUEN: String!
    $bankAccountNumber: String
    $ownerHomeAddress: String!
    $address: String!
    $postalCode: String!
    $postalCountryId: Int!
    $educationalCategoryIds: [Int!]!
    $franchiseeName: String!
    $franchiseeEducationalCategoryId: filterInteger
    $franchiseeEducationalCategoryStatus: filterString
    $franchiseeEducationalCategoryEducationalLevelId: filterInteger
    $franchiseeEducationalCategoryEducationalLevelStatus: filterString
    $franchiseeEducationalCategoryEducationalLevelEducationalTermId: filterInteger
    $franchiseeEducationalCategoryEducationalLevelEducationalTermStatus: filterString
    $isFranchiseeOwnerNameNeed: Boolean = false
    $isFranchiseeOwnerEmailNeed: Boolean = false
    $isFranchiseeOwnerIsdCodeNeed: Boolean = false
    $isFranchiseeOwnerMobileNumberNeed: Boolean = false
    $isFranchiseeOwnerHomeAddressNeed: Boolean = false
    $isFranchiseeStatusNeed: Boolean = false
    $isFranchiseePrefixNeed: Boolean = false
    $isFranchiseeCompanyUENNeed: Boolean = false
    $isFranchiseeBankAccountNumberNeed: Boolean = false
    $isFranchiseeCountryNeed: Boolean = false
    $isFranchiseePasswordNeed: Boolean = false
    $isFranchiseeAddressNeed: Boolean = false
    $isFranchiseePostalCodeNeed: Boolean = false
    $isFranchiseePostalCountryNeed: Boolean = false
    $isFranchiseeEducationalCategoriesNeed: Boolean = false
    $isFranchiseeFranchiseeCompanyNameNeed: Boolean = false
    $isFranchiseeMasterFranchiseeInformationNeed: Boolean = false
    $isFranchiseeEducationalCategoryEducationalLevelNeed: Boolean = false
    $isFranchiseeEducationalCategoryEducationalLevelEducationalTermNeed: Boolean = false
  ) {
    createFranchisee: createFranchiseeInformation(
      masterFranchiseeInformationId: $masterFranchiseeInformationId
      countryId: $countryId
      ownerName: $ownerName
      ownerEmail: $ownerEmail
      ownerMobileNumber: $ownerMobileNumber
      prefix: $prefix
      companyName: $companyName
      companyUEN: $companyUEN
      bankAccountNumber: $bankAccountNumber
      ownerHomeAddress: $ownerHomeAddress
      address: $address
      postalCode: $postalCode
      postalCountryId: $postalCountryId
      educationalCategoryIds: $educationalCategoryIds
      franchiseeName: $franchiseeName
    ) {
      ...franchiseeFragment
    }
  }
`;

const UPDATE_FRANCHISEE: TypedDocumentNode<
  UpdateFranchiseeResponse,
  UpdateFranchiseeArgs
> = gql`
  ${FRANCHISEE_FRAGMENT}
  mutation UpdateFranchisee(
    $id: Int!
    $ownerHomeAddress: String
    $countryId: Int
    $ownerName: String
    $ownerEmail: String
    $ownerIsdCode: String
    $ownerMobileNumber: String
    $status: String
    $prefix: String
    $companyName: String
    $companyUEN: String
    $bankAccountNumber: String
    $password: String
    $postalCountryId: Int
    $postalCode: String
    $address: String
    $educationalCategoryIds: [Int!]
    $franchiseeName: String
    $franchiseeEducationalCategoryId: filterInteger
    $franchiseeEducationalCategoryStatus: filterString
    $franchiseeEducationalCategoryEducationalLevelId: filterInteger
    $franchiseeEducationalCategoryEducationalLevelStatus: filterString
    $franchiseeEducationalCategoryEducationalLevelEducationalTermId: filterInteger
    $franchiseeEducationalCategoryEducationalLevelEducationalTermStatus: filterString
    $isFranchiseeOwnerNameNeed: Boolean = false
    $isFranchiseeOwnerEmailNeed: Boolean = false
    $isFranchiseeOwnerIsdCodeNeed: Boolean = false
    $isFranchiseeOwnerMobileNumberNeed: Boolean = false
    $isFranchiseeOwnerHomeAddressNeed: Boolean = false
    $isFranchiseeStatusNeed: Boolean = false
    $isFranchiseePrefixNeed: Boolean = false
    $isFranchiseeCompanyUENNeed: Boolean = false
    $isFranchiseeBankAccountNumberNeed: Boolean = false
    $isFranchiseeCountryNeed: Boolean = false
    $isFranchiseePasswordNeed: Boolean = false
    $isFranchiseeAddressNeed: Boolean = false
    $isFranchiseePostalCodeNeed: Boolean = false
    $isFranchiseePostalCountryNeed: Boolean = false
    $isFranchiseeEducationalCategoriesNeed: Boolean = false
    $isFranchiseeFranchiseeCompanyNameNeed: Boolean = false
    $isFranchiseeMasterFranchiseeInformationNeed: Boolean = false
    $isFranchiseeEducationalCategoryEducationalLevelNeed: Boolean = false
    $isFranchiseeEducationalCategoryEducationalLevelEducationalTermNeed: Boolean = false
  ) {
    updateFranchisee: updateFranchiseeInformation(
      id: $id
      ownerHomeAddress: $ownerHomeAddress
      countryId: $countryId
      ownerName: $ownerName
      ownerEmail: $ownerEmail
      ownerIsdCode: $ownerIsdCode
      ownerMobileNumber: $ownerMobileNumber
      status: $status
      prefix: $prefix
      companyName: $companyName
      companyUEN: $companyUEN
      bankAccountNumber: $bankAccountNumber
      password: $password
      postalCountryId: $postalCountryId
      postalCode: $postalCode
      address: $address
      educationalCategoryIds: $educationalCategoryIds
      franchiseeName: $franchiseeName
    ) {
      ...franchiseeFragment
    }
  }
`;

const DELETE_FRANCHISEE: TypedDocumentNode<
  DeleteFranchiseeResponse,
  DeleteFranchiseeArgs
> = gql`
  mutation DeleteFranchisee($id: Int!) {
    deleteFranchisee: deleteFranchiseeInformation(id: $id)
  }
`;

const GENERATE_FRANCHISEE_CSV: TypedDocumentNode<
  GenerateFranchiseeCSVResponse,
  GenerateFranchiseeCSVArgs
> = gql`
  mutation GenerateFranchiseeCSV {
    generateFranchiseeCSV: generateFranchiseeInformationCSV
  }
`;

export {
  CREATE_FRANCHISEE,
  UPDATE_FRANCHISEE,
  DELETE_FRANCHISEE,
  GENERATE_FRANCHISEE_CSV,
};
