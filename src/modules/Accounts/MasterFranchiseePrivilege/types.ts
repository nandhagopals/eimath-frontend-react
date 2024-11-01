import { z } from "zod";

import { Nullish } from "global/types";

import { ResourceId } from "modules/Accounts/RoleAccess";

type GetMasterFranchiseePrivilegeReturnType = Nullish<{
  getMasterFranchiseePrivilege: {
    resourceId: ResourceId[];
  };
}>;

interface GetMasterFranchiseePrivilegeArgs {
  type: "MF Owner" | "MF Staff";
}

interface ManageMasterFranchiseePrivilegeArgs {
  type: "MF Owner" | "MF Staff";
  allowedResourceIds: string[] | null;
  intermediateResourceIds: string[] | null;
}

const masterFranchiseePrivilegeFormSchema = z.object({
  type: z.enum(["MF Owner", "MF Staff"]),
});

type MasterFranchiseePrivilegeForm = z.infer<
  typeof masterFranchiseePrivilegeFormSchema
>;

export { masterFranchiseePrivilegeFormSchema };

export type {
  GetMasterFranchiseePrivilegeReturnType,
  GetMasterFranchiseePrivilegeArgs,
  MasterFranchiseePrivilegeForm,
  ManageMasterFranchiseePrivilegeArgs,
};
