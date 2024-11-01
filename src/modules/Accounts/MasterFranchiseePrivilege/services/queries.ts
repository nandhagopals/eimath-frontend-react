import { TypedDocumentNode, gql } from "@apollo/client";

import { RESOURCE_ID_FRAGMENT } from "modules/Accounts/RoleAccess";
import { GetMasterFranchiseePrivilegeArgs, GetMasterFranchiseePrivilegeReturnType } from "modules/Accounts/MasterFranchiseePrivilege";

const GET_MASTER_FRANCHISEE_PRIVILEGE: TypedDocumentNode<GetMasterFranchiseePrivilegeReturnType,GetMasterFranchiseePrivilegeArgs> = gql`
  ${RESOURCE_ID_FRAGMENT}
  query GetMasterFranchiseePrivilege($type: String!) {
    getMasterFranchiseePrivilege(type: $type) {
      resourceId {
        ...resourceIdFragment
      }
    }
  }
`;

export { GET_MASTER_FRANCHISEE_PRIVILEGE } ;
