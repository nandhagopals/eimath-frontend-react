import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CreateRoleArgs,
  CreateRoleResponse,
  DeleteRoleArgs,
  DeleteRoleResponse,
  UpdateRoleArgs,
  UpdateRoleResponse,
} from "modules/Accounts/RoleAccess";

const CREATE_ROLE: TypedDocumentNode<CreateRoleResponse, CreateRoleArgs> = gql`
  mutation CreateRole(
    $name: String!
    $description: String
    $hasFullPrivilege: Boolean
    $intermediateResourceIds: [String]
    $allowedResourceIds: [String]
  ) {
    createRole(
      name: $name
      description: $description
      hasFullPrivilege: $hasFullPrivilege
      intermediateResourceIds: $intermediateResourceIds
      allowedResourceIds: $allowedResourceIds
    ) {
      id
    }
  }
`;

const UPDATE_ROLE: TypedDocumentNode<UpdateRoleResponse, UpdateRoleArgs> = gql`
  mutation UpdateRole(
    $id: Int!
    $name: String
    $description: String
    $hasFullPrivilege: Boolean
    $allowedResourceIds: [String]
    $intermediateResourceIds: [String]
  ) {
    updateRole(
      id: $id
      name: $name
      description: $description
      hasFullPrivilege: $hasFullPrivilege
      allowedResourceIds: $allowedResourceIds
      intermediateResourceIds: $intermediateResourceIds
    ) {
      id
    }
  }
`;

const DELETE_ROLE: TypedDocumentNode<DeleteRoleResponse, DeleteRoleArgs> = gql`
  mutation DeleteRole($id: Int!) {
    deleteRole(id: $id)
  }
`;

export { CREATE_ROLE, UPDATE_ROLE, DELETE_ROLE };
