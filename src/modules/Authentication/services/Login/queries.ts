import { TypedDocumentNode, gql } from "@apollo/client";

import {
  AuthUserDetails,
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterInteger,
} from "global/types";

export const GET_LOGIN_USER_DETAILS: TypedDocumentNode<
  CursorPaginationReturnType<AuthUserDetails>,
  CursorPaginationArgs<{ id: FilterInteger }>
> = gql`
  query GetLoginUserDetails($id: filterInteger) {
    filterUsers(filter: { id: $id }) {
      edges {
        node {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        totalNumberOfItems
        endCursor
        startCursor
      }
    }
  }
`;
