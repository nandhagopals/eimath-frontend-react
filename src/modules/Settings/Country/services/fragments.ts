import { gql } from "@apollo/client";

const COUNTRY_FRAGMENT = gql`
  fragment countryFragment on Country {
    id
    name
    code @include(if: $isCountryCodeNeed)
    isdCode @include(if: $isCountryIsdCodeNeed)
    currency @include(if: $isCountryCurrencyNeed)
    status @include(if: $isCountryStatusNeed)
  }
`;

export { COUNTRY_FRAGMENT };
