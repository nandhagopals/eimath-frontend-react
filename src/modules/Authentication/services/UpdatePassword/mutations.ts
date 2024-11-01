import { TypedDocumentNode, gql } from "@apollo/client";

import {
  UpdatePasswordArgs,
  UpdatePasswordResponse,
} from "modules/Authentication";

const SEND_FORGOT_PASSWORD_MAIL = gql`
  mutation SendForgotPasswordMail($email: String!) {
    sendForgotPasswordMail(email: $email)
  }
`;

const UPDATE_PASSWORD: TypedDocumentNode<
  UpdatePasswordResponse,
  UpdatePasswordArgs
> = gql`
  mutation UpdatePassword($id: Int!, $resetToken: String!, $password: String!) {
    updatePassword(id: $id, resetToken: $resetToken, password: $password)
  }
`;

export { SEND_FORGOT_PASSWORD_MAIL, UPDATE_PASSWORD };
