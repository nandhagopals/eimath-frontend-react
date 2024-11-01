import { TypedDocumentNode, gql } from "@apollo/client";

import { ManageFranchiseePrivilegeArgs } from "modules/Accounts/FranchiseePrivilege/types";

const MANAGE_FRANCHISEE_PRIVILEGE: TypedDocumentNode<
  string,
  ManageFranchiseePrivilegeArgs
> = gql`
  mutation ManageFranchiseePrivilege(
    $allowedResourceIds: [String]
    $intermediateResourceIds: [String]
  ) {
    manageFranchiseePrivilege(
      allowedResourceIds: $allowedResourceIds
      intermediateResourceIds: $intermediateResourceIds
    )
  }
`;

export { MANAGE_FRANCHISEE_PRIVILEGE };
