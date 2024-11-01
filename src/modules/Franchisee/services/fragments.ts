import { gql } from "@apollo/client";

const FRANCHISEE_FRAGMENT = gql`
  fragment franchiseeFragment on FranchiseeInformation {
    id
    franchiseeName
    companyName @include(if: $isFranchiseeFranchiseeCompanyNameNeed)
    ownerName @include(if: $isFranchiseeOwnerNameNeed)
    ownerEmail @include(if: $isFranchiseeOwnerEmailNeed)
    ownerIsdCode @include(if: $isFranchiseeOwnerIsdCodeNeed)
    ownerMobileNumber @include(if: $isFranchiseeOwnerMobileNumberNeed)
    ownerHomeAddress @include(if: $isFranchiseeOwnerHomeAddressNeed)
    status @include(if: $isFranchiseeStatusNeed)
    prefix @include(if: $isFranchiseePrefixNeed)
    companyUEN @include(if: $isFranchiseeCompanyUENNeed)
    bankAccountNumber @include(if: $isFranchiseeBankAccountNumberNeed)
    country @include(if: $isFranchiseeCountryNeed) {
      id
      name
      isdCode
      code
    }
    password @include(if: $isFranchiseePasswordNeed)
    address @include(if: $isFranchiseeAddressNeed)
    postalCode @include(if: $isFranchiseePostalCodeNeed)
    postalCountry @include(if: $isFranchiseePostalCountryNeed) {
      id
      name
    }
    educationalCategories: educationCategory(
      id: $franchiseeEducationalCategoryId
      status: $franchiseeEducationalCategoryStatus
    ) @include(if: $isFranchiseeEducationalCategoriesNeed) {
      id
      name
      educationalCategoryLevels(
        educationalLevelId: $franchiseeEducationalCategoryEducationalLevelId
        educationalLevelStatus: $franchiseeEducationalCategoryEducationalLevelStatus
      ) @include(if: $isFranchiseeEducationalCategoryEducationalLevelNeed) {
        educationalLevel {
          id
          name
          educationalLevelTerms(
            educationalTermId: $franchiseeEducationalCategoryEducationalLevelEducationalTermId
            educationalTermStatus: $franchiseeEducationalCategoryEducationalLevelEducationalTermStatus
          )
            @include(
              if: $isFranchiseeEducationalCategoryEducationalLevelEducationalTermNeed
            ) {
            educationalTerm {
              id
              name
            }
          }
        }
      }
    }
    masterFranchiseeInformation
      @include(if: $isFranchiseeMasterFranchiseeInformationNeed) {
      id
      masterFranchiseeName
      currency
    }
  }
`;

export { FRANCHISEE_FRAGMENT };
