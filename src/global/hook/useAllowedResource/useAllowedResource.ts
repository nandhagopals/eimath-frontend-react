import { useReactiveVar } from "@apollo/client";

import { allowedResourceIds } from "global/cache/cache";
import type {
  AllowedResourceReturnType,
  UseFindIsResourceIdsHasCheckedArgs,
  UseFindIsResourceIdsHasCheckedReturnType,
} from "global/hook/useAllowedResource/types";

const useAllowedResource = <T extends boolean | undefined = undefined>(
  resourceName: string,
  getAllAllowedAccess?: T,
  getAllProfileAllowedAccess?: T
): AllowedResourceReturnType<T> => {
  const allowedResources = useReactiveVar(allowedResourceIds);
  const nodes = allowedResources || [];

  if (nodes && nodes.length > 0) {
    if (!nodes?.includes(resourceName) && !getAllAllowedAccess) {
      // console.error(
      //   `Please give the correct resource id name = ${resourceName}`
      // );
    }
    if (!getAllProfileAllowedAccess && getAllAllowedAccess) {
      const canRead = nodes.includes(`Read${resourceName}Information`);
      const canCreate = nodes.includes(`Create${resourceName}`);
      const canUpdate = nodes.includes(`Update${resourceName}`);
      const canDelete = nodes.includes(`Delete${resourceName}`);

      return {
        canRead,
        canCreate,
        canUpdate,
        canDelete,
      } as AllowedResourceReturnType<T>;
    } else if (getAllProfileAllowedAccess) {
      const canRead = nodes.includes(`ProfileRead${resourceName}Information`);
      const canCreate = nodes.includes(`ProfileCreate${resourceName}`);
      const canUpdate = nodes.includes(`ProfileUpdate${resourceName}`);
      const canDelete = nodes.includes(`ProfileDelete${resourceName}`);

      return {
        canRead,
        canCreate,
        canUpdate,
        canDelete,
      } as AllowedResourceReturnType<T>;
    } else {
      return nodes?.includes(resourceName)
        ? (true as AllowedResourceReturnType<T>)
        : (false as AllowedResourceReturnType<T>);
    }
  } else {
    if (!getAllProfileAllowedAccess && getAllAllowedAccess) {
      return {
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
      } as AllowedResourceReturnType<T>;
    } else if (getAllProfileAllowedAccess) {
      return {
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
      } as AllowedResourceReturnType<T>;
    } else {
      return false as AllowedResourceReturnType<T>;
    }
  }
};

const useFindIsResourceIdsHasChecked = <
  T extends UseFindIsResourceIdsHasCheckedArgs = string[]
>(
  aclResource: T
): UseFindIsResourceIdsHasCheckedReturnType<T> => {
  const allowedResources = useReactiveVar(allowedResourceIds);

  const nodes = allowedResources || [];

  if (nodes && nodes.length > 0) {
    if ("getProfileCRUDOperation" in aclResource) {
      const canRead = nodes.includes(
        `ProfileRead${aclResource.text}Information`
      );
      const canCreate = nodes.includes(`ProfileCreate${aclResource.text}`);
      const canUpdate = nodes.includes(`ProfileUpdate${aclResource.text}`);
      const canDelete = nodes.includes(`ProfileDelete${aclResource.text}`);

      return {
        canRead,
        canCreate,
        canUpdate,
        canDelete,
      } as UseFindIsResourceIdsHasCheckedReturnType<T>;
    } else if ("getCRUDOperation" in aclResource) {
      const canRead = nodes.includes(`Read${aclResource.text}Information`);
      const canCreate = nodes.includes(`Create${aclResource.text}`);
      const canUpdate = nodes.includes(`Update${aclResource.text}`);
      const canDelete = nodes.includes(`Delete${aclResource.text}`);

      return {
        canRead,
        canCreate,
        canUpdate,
        canDelete,
      } as UseFindIsResourceIdsHasCheckedReturnType<T>;
    } else if (aclResource?.length === 1) {
      return nodes?.includes(
        aclResource[0]
      ) as UseFindIsResourceIdsHasCheckedReturnType<T>;
    } else {
      return aclResource?.some((aclResource) => {
        return nodes.includes(aclResource);
      }) as UseFindIsResourceIdsHasCheckedReturnType<T>;
    }
  } else {
    if (
      "getProfileCRUDOperation" in aclResource ||
      "getCRUDOperation" in aclResource
    ) {
      return {
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
      } as UseFindIsResourceIdsHasCheckedReturnType<T>;
    } else {
      return false as UseFindIsResourceIdsHasCheckedReturnType<T>;
    }
  }
};

export { useAllowedResource, useFindIsResourceIdsHasChecked };
