import { gql } from "@apollo/client";
const RESOURCE_ID_FRAGMENT = gql`
  fragment resourceIdFragment on resourceId {
    id
    title
    isAllowed
    isIntermediate
    childNodes {
      id
      title
      isAllowed
      isIntermediate
      childNodes {
        id
        title
        isAllowed
        isIntermediate
        childNodes {
          id
          title
          isAllowed
          isIntermediate
          childNodes {
            id
            title
            isAllowed
            isIntermediate
            childNodes {
              id
              title
              isAllowed
              isIntermediate
            }
          }
        }
      }
    }
  }
`;

const ROLE_FRAGMENT = gql`
  ${RESOURCE_ID_FRAGMENT}
  fragment roleFragment on Role {
    id
    name
    description @include(if: $isRoleDescriptionNeed)
    hasFullPrivilege @include(if: $isRoleHasFullPrivilegeNeed)
    resourceIds @include(if: $isRoleResourceIdsNeed)
    allowedResourceIds @include(if: $isRoleAllowedResourceIdsNeed) {
      resourceId {
        ...resourceIdFragment
      }
    }
  }
`;

export { ROLE_FRAGMENT, RESOURCE_ID_FRAGMENT };
