import { TypedDocumentNode, gql } from "@apollo/client";

import { LoginArgs, LoginResponse } from "modules/Authentication";

export const LOGIN: TypedDocumentNode<LoginResponse, LoginArgs> = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      userId
      token
    }
  }
`;
