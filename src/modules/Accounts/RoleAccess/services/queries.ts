import { TypedDocumentNode, gql } from "@apollo/client";

import {
  ROLE_FRAGMENT,
  FilterRolesResponse,
  FilterRolesArgs,
  RESOURCE_ID_FRAGMENT,
  ACLTreeResponse,
  ACLTreeArgs,
} from "modules/Accounts/RoleAccess";
import { PAGINATION_INFO_FRAGMENT } from "global/services";

const FILTER_ROLES: TypedDocumentNode<
  FilterRolesResponse,
  FilterRolesArgs
> = gql`
  ${ROLE_FRAGMENT}
  ${PAGINATION_INFO_FRAGMENT}
  query FilterRoles(
    $filter: RoleFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isRoleDescriptionNeed: Boolean = false
    $isRoleHasFullPrivilegeNeed: Boolean = false
    $isRoleResourceIdsNeed: Boolean = false
    $isRoleAllowedResourceIdsNeed: Boolean = false
  ) {
    filterRoles(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...roleFragment
        }
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

const ACL_TREE: TypedDocumentNode<ACLTreeResponse, ACLTreeArgs> = gql`
  ${RESOURCE_ID_FRAGMENT}
  query aclTree(
    $isMyRole: Boolean
    $isACLTreeAllowedResourceIdsNeed: Boolean = false
    $isACLTreeResourceIdNeed: Boolean = false
  ) {
    aclTree(isMyRole: $isMyRole) {
      allowedResourceIds @include(if: $isACLTreeAllowedResourceIdsNeed)
      resourceId @include(if: $isACLTreeResourceIdNeed) {
        ...resourceIdFragment
      }
    }
  }
`;

export { FILTER_ROLES, ACL_TREE };
