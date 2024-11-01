import { gql } from "@apollo/client";

const HQ_PROFILE_INFORMATION_FRAGMENT = gql`
  fragment hqProfileInformationFragment on HQProfile {
    id
    name
    companyName @include(if: $isHQProfileInformationCompanyNameNeed)
    companyUEN @include(if: $isHQProfileInformationCompanyUENNeed)
    mobileNumber @include(if: $isHQProfileInformationMobileNumberNeed)
    bankAccountNumber @include(if: $isHQProfileInformationBankAccountNumberNeed)
    email @include(if: $isHQProfileInformationEmailNeed)
    country: isdCountry @include(if: $isHQProfileInformationIsdCountryNeed) {
      id
      name
      isdCode
    }
    address @include(if: $isHQProfileInformationAddressNeed)
    postalCode @include(if: $isHQProfileInformationPostalCodeNeed)
    postalCountry @include(if: $isHQProfileInformationPostalCountryNeed) {
      id
      name
    }
  }
`;

export { HQ_PROFILE_INFORMATION_FRAGMENT };
