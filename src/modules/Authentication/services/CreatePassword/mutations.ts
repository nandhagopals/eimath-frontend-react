import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CreatePasswordArgs,
  CreatePasswordResponse,
} from "modules/Authentication";

const CREATE_MF_PASSWORD: TypedDocumentNode<
  CreatePasswordResponse,
  CreatePasswordArgs
> = gql`
  mutation CreateMFOwnerPassword(
    $id: Int!
    $confirmationToken: String!
    $password: String!
  ) {
    createPassword: createMFOwnerPassword(
      id: $id
      confirmationToken: $confirmationToken
      password: $password
    )
  }
`;

const CREATE_FRANCHISEE_PASSWORD: TypedDocumentNode<
  CreatePasswordResponse,
  CreatePasswordArgs
> = gql`
  mutation CreateFranchiseeOwnerPassword(
    $id: Int!
    $confirmationToken: String!
    $password: String!
  ) {
    createPassword: createFranchiseeOwnerPassword(
      id: $id
      confirmationToken: $confirmationToken
      password: $password
    )
  }
`;

export { CREATE_MF_PASSWORD, CREATE_FRANCHISEE_PASSWORD };
