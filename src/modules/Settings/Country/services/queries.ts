import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  COUNTRY_FRAGMENT,
  type FilterCountiesArgs,
  type FilterCountiesResponse,
} from "modules/Settings/Country";

const FILTER_COUNTRIES: TypedDocumentNode<
  FilterCountiesResponse,
  FilterCountiesArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${COUNTRY_FRAGMENT}
  query FilterCountries(
    $filter: CountryFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isCountryCodeNeed: Boolean = false
    $isCountryIsdCodeNeed: Boolean = false
    $isCountryCurrencyNeed: Boolean = false
    $isCountryStatusNeed: Boolean = false
  ) {
    filterCountries(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...countryFragment
        }
        cursor
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_COUNTRIES };
