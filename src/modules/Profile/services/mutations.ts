import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CreateHQProfileArgs,
  CreateHQProfileResponse,
  HQ_PROFILE_INFORMATION_FRAGMENT,
  UpdateHQProfileArgs,
  UpdateHQProfileResponse,
} from "modules/Profile";

export const CREATE_HQ_PROFILE_INFORMATION: TypedDocumentNode<
  CreateHQProfileResponse,
  CreateHQProfileArgs
> = gql`
  ${HQ_PROFILE_INFORMATION_FRAGMENT}
  mutation CreateHQProfileInformation(
    $name: String!
    $companyName: String!
    $companyUEN: String!
    $bankAccountNumber: String!
    $email: String!
    $isdCountryId: Int!
    $mobileNumber: String!
    $address: String!
    $postalCode: String!
    $postalCountryId: Int!
    $isHQProfileInformationCompanyNameNeed: Boolean = false
    $isHQProfileInformationCompanyUENNeed: Boolean = false
    $isHQProfileInformationBankAccountNumberNeed: Boolean = false
    $isHQProfileInformationEmailNeed: Boolean = false
    $isHQProfileInformationIsdCountryNeed: Boolean = false
    $isHQProfileInformationMobileNumberNeed: Boolean = false
    $isHQProfileInformationAddressNeed: Boolean = false
    $isHQProfileInformationPostalCodeNeed: Boolean = false
    $isHQProfileInformationPostalCountryNeed: Boolean = false
  ) {
    createHQProfile(
      name: $name
      companyName: $companyName
      companyUEN: $companyUEN
      bankAccountNumber: $bankAccountNumber
      email: $email
      isdCountryId: $isdCountryId
      mobileNumber: $mobileNumber
      address: $address
      postalCode: $postalCode
      postalCountryId: $postalCountryId
    ) {
      ...hqProfileInformationFragment
    }
  }
`;

export const UPDATE_HQ_PROFILE_INFORMATION: TypedDocumentNode<
  UpdateHQProfileResponse,
  UpdateHQProfileArgs
> = gql`
  ${HQ_PROFILE_INFORMATION_FRAGMENT}
  mutation UpdateHQProfileInformation(
    $id: Int!
    $name: String
    $companyName: String
    $companyUEN: String
    $bankAccountNumber: String
    $email: String
    $isdCountryId: Int
    $mobileNumber: String
    $address: String
    $postalCode: String
    $postalCountryId: Int
    $isHQProfileInformationCompanyNameNeed: Boolean = false
    $isHQProfileInformationCompanyUENNeed: Boolean = false
    $isHQProfileInformationBankAccountNumberNeed: Boolean = false
    $isHQProfileInformationEmailNeed: Boolean = false
    $isHQProfileInformationIsdCountryNeed: Boolean = false
    $isHQProfileInformationMobileNumberNeed: Boolean = false
    $isHQProfileInformationAddressNeed: Boolean = false
    $isHQProfileInformationPostalCodeNeed: Boolean = false
    $isHQProfileInformationPostalCountryNeed: Boolean = false
  ) {
    updateHQProfile(
      id: $id
      name: $name
      companyName: $companyName
      companyUEN: $companyUEN
      bankAccountNumber: $bankAccountNumber
      email: $email
      isdCountryId: $isdCountryId
      mobileNumber: $mobileNumber
      address: $address
      postalCode: $postalCode
      postalCountryId: $postalCountryId
    ) {
      ...hqProfileInformationFragment
    }
  }
`;
