import { TypedDocumentNode, gql } from "@apollo/client";

import { RESOURCE_ID_FRAGMENT } from "modules/Accounts/RoleAccess";
import { GetFranchiseePrivilegeReturnType } from "modules/Accounts/FranchiseePrivilege/types";

const GET_FRANCHISEE_PRIVILEGE: TypedDocumentNode<GetFranchiseePrivilegeReturnType> = gql`
  ${RESOURCE_ID_FRAGMENT}
  query GetFranchiseePrivilege {
    getFranchiseePrivilege {
      resourceId {
        ...resourceIdFragment
      }
    }
  }
`;

export { GET_FRANCHISEE_PRIVILEGE } ;
