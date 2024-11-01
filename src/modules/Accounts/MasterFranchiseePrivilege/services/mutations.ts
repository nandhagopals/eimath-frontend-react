import { TypedDocumentNode, gql } from "@apollo/client";

import { ManageMasterFranchiseePrivilegeArgs } from "modules/Accounts/MasterFranchiseePrivilege";

const MANAGE_MASTER_FRANCHISEE_PRIVILEGE: TypedDocumentNode<
  string,
  ManageMasterFranchiseePrivilegeArgs
> = gql`
  mutation ManageMasterFranchiseePrivilege(
    $type: String!
    $allowedResourceIds: [String]
    $intermediateResourceIds: [String]
  ) {
    manageMasterFranchiseePrivilege(
      type: $type
      allowedResourceIds: $allowedResourceIds
      intermediateResourceIds: $intermediateResourceIds
    )
  }
`;

export { MANAGE_MASTER_FRANCHISEE_PRIVILEGE };
