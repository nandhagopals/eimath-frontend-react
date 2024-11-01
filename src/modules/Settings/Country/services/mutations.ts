import { TypedDocumentNode, gql } from "@apollo/client";

import {
  COUNTRY_FRAGMENT,
  CreateCountryArgs,
  CreateCountryResponse,
  DeleteCountryResponse,
  UpdateCountryArgs,
  UpdateCountryResponse,
} from "modules/Settings/Country";

const CREATE_COUNTRY: TypedDocumentNode<
  CreateCountryResponse,
  CreateCountryArgs
> = gql`
  ${COUNTRY_FRAGMENT}
  mutation CreateCountry(
    $name: String!
    $code: String!
    $isdCode: String!
    $currency: String!
    $isCountryCodeNeed: Boolean = false
    $isCountryIsdCodeNeed: Boolean = false
    $isCountryCurrencyNeed: Boolean = false
    $isCountryStatusNeed: Boolean = false
  ) {
    createCountry(
      name: $name
      code: $code
      isdCode: $isdCode
      currency: $currency
    ) {
      ...countryFragment
    }
  }
`;

const UPDATE_COUNTRY: TypedDocumentNode<
  UpdateCountryResponse,
  UpdateCountryArgs
> = gql`
  ${COUNTRY_FRAGMENT}
  mutation UpdateCountry(
    $id: Int!
    $name: String
    $code: String
    $isdCode: String
    $currency: String
    $status: String
    $isCountryCodeNeed: Boolean = false
    $isCountryIsdCodeNeed: Boolean = false
    $isCountryCurrencyNeed: Boolean = false
    $isCountryStatusNeed: Boolean = false
  ) {
    updateCountry(
      id: $id
      name: $name
      code: $code
      isdCode: $isdCode
      currency: $currency
      status: $status
    ) {
      ...countryFragment
    }
  }
`;

const DELETE_COUNTRY: TypedDocumentNode<
  DeleteCountryResponse,
  UpdateCountryArgs
> = gql`
  mutation DeleteCountry($id: Int!) {
    deleteCountry(id: $id)
  }
`;

export { CREATE_COUNTRY, UPDATE_COUNTRY, DELETE_COUNTRY };
