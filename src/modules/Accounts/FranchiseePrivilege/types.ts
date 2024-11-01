import { Nullish } from "global/types";

import { ResourceId } from "modules/Accounts/RoleAccess";

type GetFranchiseePrivilegeReturnType = Nullish<{
  getFranchiseePrivilege: {
    resourceId: ResourceId[];
  };
}>;

interface ManageFranchiseePrivilegeArgs {
  allowedResourceIds: string[] | null;
  intermediateResourceIds: string[] | null;
}

export type {
  GetFranchiseePrivilegeReturnType,
  ManageFranchiseePrivilegeArgs,
};
