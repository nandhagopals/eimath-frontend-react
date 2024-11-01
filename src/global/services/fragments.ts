import { gql } from "@apollo/client";

const PAGINATION_INFO_FRAGMENT = gql`
  fragment paginationInfoFragment on PaginationInfo {
    hasNextPage
    hasPreviousPage
    totalNumberOfItems
    endCursor
    startCursor
  }
`;

export { PAGINATION_INFO_FRAGMENT };
