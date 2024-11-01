import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CreateMasterFranchiseeInformationArgs,
  CreateMasterFranchiseeInformationResponse,
  GenerateMasterFranchiseeCSVArgs,
  GenerateMasterFranchiseeCSVResponse,
  MASTER_FRANCHISEE_INFORMATION_FRAGMENT,
  UpdateMasterFranchiseeInformationArgs,
  UpdateMasterFranchiseeInformationResponse,
} from "modules/MasterFranchisee";

const CREATE_MASTER_FRANCHISEE_INFORMATION: TypedDocumentNode<
  CreateMasterFranchiseeInformationResponse,
  CreateMasterFranchiseeInformationArgs
> = gql`
  ${MASTER_FRANCHISEE_INFORMATION_FRAGMENT}
  mutation CreateMasterFranchiseeInformation(
    $ownerName: String!
    $ownerEmail: String!
    $isdCountryId: Int!
    $ownerMobileNumber: String!
    $currencyCountryId: Int!
    $inSingapore: Boolean!
    $masterFranchiseeName: String!
    $prefix: String!
    $companyName: String!
    $companyUEN: String!
    $educationalCategoryIds: [Int!]!
    $revenueRoyalties: Float!
    $royaltiesFromFranchisee: Float!
    $address: String!
    $postalCode: String!
    $postalCountryId: Int!
    $pricePerSGD: Float
    $isMasterFranchiseeInformationOwnerNameNeed: Boolean = false
    $isMasterFranchiseeInformationOwnerEmailNeed: Boolean = false
    $isMasterFranchiseeInformationOwnerPasswordNeed: Boolean = false
    $isMasterFranchiseeInformationIsdCountryNeed: Boolean = false
    $isMasterFranchiseeInformationOwnerMobileNumberNeed: Boolean = false
    $isMasterFranchiseeInformationCurrencyCountryNeed: Boolean = false
    $isMasterFranchiseeInformationStatusNeed: Boolean = false
    $isMasterFranchiseeInformationPrefixNeed: Boolean = false
    $isMasterFranchiseeInformationCompanyNameNeed: Boolean = false
    $isMasterFranchiseeInformationCompanyUENNeed: Boolean = false
    $isMasterFranchiseeInformationRevenueRoyaltiesNeed: Boolean = false
    $isMasterFranchiseeInformationRoyaltiesFromFranchiseNeed: Boolean = false
    $isMasterFranchiseeInformationInSingaporeNeed: Boolean = false
    $isMasterFranchiseeInformationBankAccountNumberNeed: Boolean = false
    $isMasterFranchiseeInformationOwnerIsdCodeNeed: Boolean = false
    $isMasterFranchiseeInformationCurrencyNeed: Boolean = false
    $isMasterFranchiseeInformationEducationCategoryNeed: Boolean = false
    $isMasterFranchiseeInformationAddressNeed: Boolean = false
    $isMasterFranchiseeInformationPostalCodeNeed: Boolean = false
    $isMasterFranchiseeInformationPostalCountryNeed: Boolean = false
    $isMasterFranchiseeMasterFranchiseeProductNeed: Boolean = false
    $isMasterFranchiseeMasterFranchiseeWorkBookNeed: Boolean = false
    $isMasterFranchiseeMasterFranchiseeEducationalTermNeed: Boolean = false
    $isMasterFranchiseePricePerSGDNeed: Boolean = false
  ) {
    createMasterFranchiseeInformation(
      ownerName: $ownerName
      ownerEmail: $ownerEmail
      isdCountryId: $isdCountryId
      ownerMobileNumber: $ownerMobileNumber
      currencyCountryId: $currencyCountryId
      inSingapore: $inSingapore
      masterFranchiseeName: $masterFranchiseeName
      prefix: $prefix
      companyName: $companyName
      companyUEN: $companyUEN
      educationalCategoryIds: $educationalCategoryIds
      revenueRoyalties: $revenueRoyalties
      royaltiesFromFranchise: $royaltiesFromFranchisee
      address: $address
      postalCode: $postalCode
      postalCountryId: $postalCountryId
      pricePerSGD: $pricePerSGD
    ) {
      ...masterFranchiseeInformationFragment
    }
  }
`;

const UPDATE_MASTER_FRANCHISEE_INFORMATION: TypedDocumentNode<
  UpdateMasterFranchiseeInformationResponse,
  UpdateMasterFranchiseeInformationArgs
> = gql`
  ${MASTER_FRANCHISEE_INFORMATION_FRAGMENT}
  mutation UpdateMasterFranchiseeInformation(
    $id: Int!
    $ownerName: String
    $ownerEmail: String
    $ownerPassword: String
    $isdCountryId: Int
    $ownerMobileNumber: String
    $currencyCountryId: Int
    $status: String
    $masterFranchiseeName: String
    $prefix: String
    $companyUEN: String
    $companyName: String
    $revenueRoyalties: Float
    $royaltiesFromFranchisee: Float
    $bankAccountNumber: String
    $inSingapore: Boolean
    $educationalCategoryIds: [Int!]
    $postalCountryId: Int
    $postalCode: String
    $address: String
    $pricePerSGD: Float
    $isMasterFranchiseeInformationOwnerNameNeed: Boolean = false
    $isMasterFranchiseeInformationOwnerEmailNeed: Boolean = false
    $isMasterFranchiseeInformationOwnerPasswordNeed: Boolean = false
    $isMasterFranchiseeInformationIsdCountryNeed: Boolean = false
    $isMasterFranchiseeInformationOwnerMobileNumberNeed: Boolean = false
    $isMasterFranchiseeInformationCurrencyCountryNeed: Boolean = false
    $isMasterFranchiseeInformationStatusNeed: Boolean = false
    $isMasterFranchiseeInformationPrefixNeed: Boolean = false
    $isMasterFranchiseeInformationCompanyNameNeed: Boolean = false
    $isMasterFranchiseeInformationCompanyUENNeed: Boolean = false
    $isMasterFranchiseeInformationRevenueRoyaltiesNeed: Boolean = false
    $isMasterFranchiseeInformationRoyaltiesFromFranchiseNeed: Boolean = false
    $isMasterFranchiseeInformationInSingaporeNeed: Boolean = false
    $isMasterFranchiseeInformationBankAccountNumberNeed: Boolean = false
    $isMasterFranchiseeInformationOwnerIsdCodeNeed: Boolean = false
    $isMasterFranchiseeInformationCurrencyNeed: Boolean = false
    $isMasterFranchiseeInformationEducationCategoryNeed: Boolean = false
    $isMasterFranchiseeInformationAddressNeed: Boolean = false
    $isMasterFranchiseeInformationPostalCodeNeed: Boolean = false
    $isMasterFranchiseeInformationPostalCountryNeed: Boolean = false
    $isMasterFranchiseeMasterFranchiseeProductNeed: Boolean = false
    $isMasterFranchiseeMasterFranchiseeWorkBookNeed: Boolean = false
    $isMasterFranchiseeMasterFranchiseeEducationalTermNeed: Boolean = false
    $isMasterFranchiseePricePerSGDNeed: Boolean = false
  ) {
    updateMasterFranchiseeInformation(
      id: $id
      ownerName: $ownerName
      ownerEmail: $ownerEmail
      ownerPassword: $ownerPassword
      isdCountryId: $isdCountryId
      ownerMobileNumber: $ownerMobileNumber
      currencyCountryId: $currencyCountryId
      status: $status
      masterFranchiseeName: $masterFranchiseeName
      prefix: $prefix
      companyUEN: $companyUEN
      companyName: $companyName
      revenueRoyalties: $revenueRoyalties
      royaltiesFromFranchise: $royaltiesFromFranchisee
      bankAccountNumber: $bankAccountNumber
      inSingapore: $inSingapore
      educationalCategoryIds: $educationalCategoryIds
      postalCountryId: $postalCountryId
      postalCode: $postalCode
      address: $address
      pricePerSGD: $pricePerSGD
    ) {
      ...masterFranchiseeInformationFragment
    }
  }
`;

// const DELETE_MASTER_FRANCHISEE_INFORMATION: TypedDocumentNode<
//   DeleteMasterFranchiseeInformationResponse,
//   UpdateMasterFranchiseeInformationArgs
// > = gql`
//   mutation DeleteMasterFranchiseeInformation($id: Int!) {
//     deleteMasterFranchiseeInformation(id: $id)
//   }
// `;

const GENERATE_MASTER_FRANCHISEE_CSV: TypedDocumentNode<
  GenerateMasterFranchiseeCSVResponse,
  GenerateMasterFranchiseeCSVArgs
> = gql`
  mutation GenerateMasterFranchiseeCSV {
    generateMasterFranchiseeCSV: generateMFInformationCSV
  }
`;

export {
  CREATE_MASTER_FRANCHISEE_INFORMATION,
  UPDATE_MASTER_FRANCHISEE_INFORMATION,
  // DELETE_MASTER_FRANCHISEE_INFORMATION,
  GENERATE_MASTER_FRANCHISEE_CSV,
};
