import { gql } from "@apollo/client";

const MASTER_FRANCHISEE_INFORMATION_FRAGMENT = gql`
  fragment masterFranchiseeInformationFragment on MasterFranchiseeInformation {
    id
    masterFranchiseeName
    ownerName @include(if: $isMasterFranchiseeInformationOwnerNameNeed)
    ownerEmail @include(if: $isMasterFranchiseeInformationOwnerEmailNeed)
    ownerPassword @include(if: $isMasterFranchiseeInformationOwnerPasswordNeed)
    isdCountry @include(if: $isMasterFranchiseeInformationIsdCountryNeed) {
      id
      name
      isdCode
    }
    ownerMobileNumber
      @include(if: $isMasterFranchiseeInformationOwnerMobileNumberNeed)
    currencyCountry
      @include(if: $isMasterFranchiseeInformationCurrencyCountryNeed) {
      id
      name
      currency
    }
    status @include(if: $isMasterFranchiseeInformationStatusNeed)
    prefix @include(if: $isMasterFranchiseeInformationPrefixNeed)
    companyName @include(if: $isMasterFranchiseeInformationCompanyNameNeed)
    companyUEN @include(if: $isMasterFranchiseeInformationCompanyUENNeed)
    revenueRoyalties
      @include(if: $isMasterFranchiseeInformationRevenueRoyaltiesNeed)
    royaltiesFromFranchisee: royaltiesFromFranchise
      @include(if: $isMasterFranchiseeInformationRoyaltiesFromFranchiseNeed)
    inSingapore @include(if: $isMasterFranchiseeInformationInSingaporeNeed)
    bankAccountNumber
      @include(if: $isMasterFranchiseeInformationBankAccountNumberNeed)
    ownerIsdCode @include(if: $isMasterFranchiseeInformationOwnerIsdCodeNeed)
    currency @include(if: $isMasterFranchiseeInformationCurrencyNeed)
    educationalCategories: educationCategory
      @include(if: $isMasterFranchiseeInformationEducationCategoryNeed) {
      id
      name
      status
    }
    address @include(if: $isMasterFranchiseeInformationAddressNeed)
    postalCode @include(if: $isMasterFranchiseeInformationPostalCodeNeed)
    postalCountry
      @include(if: $isMasterFranchiseeInformationPostalCountryNeed) {
      id
      name
    }
    masterFranchiseeProduct
      @include(if: $isMasterFranchiseeMasterFranchiseeProductNeed) {
      id
      price
      product {
        id
        name
        points
      }
    }
    masterFranchiseeWorkBook
      @include(if: $isMasterFranchiseeMasterFranchiseeWorkBookNeed) {
      id
      price
      workbookInformation {
        id
        name
        price
      }
    }
    masterFranchiseeEducationalTerm
      @include(if: $isMasterFranchiseeMasterFranchiseeEducationalTermNeed) {
      id
      price
      educationalTerm {
        id
        name
        price
      }
    }
    pricePerSGD @include(if: $isMasterFranchiseePricePerSGDNeed)
  }
`;

export { MASTER_FRANCHISEE_INFORMATION_FRAGMENT };
