import { z } from "zod";

import { nameZodSchema } from "global/helpers";
import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

type ResourceId = {
  id: string;
  isAllowed?: boolean | null;
  isIntermediate?: boolean | null;
  title?: string | null;
  childNodes: ResourceId[] | null;
};

type ACL = Nullish<{
  resourceId?: ResourceId[] | null;
  allowedResourceIds?: string[] | null;
}>;

type Role = Nullish<{
  id: number;
  name: string;
  description: string;
  hasFullPrivilege: boolean;
  resourceIds: string[];
  allowedResourceIds: {
    resourceId?: ResourceId[] | null;
  };
}>;

type RoleFieldArgs = Nullish<{
  isRoleDescriptionNeed: boolean;
  isRoleHasFullPrivilegeNeed: boolean;
  isRoleResourceIdsNeed: boolean;
  isRoleAllowedResourceIdsNeed: boolean;
}>;

type RoleFilterInput = Nullish<{
  id: FilterInteger;
  name: FilterString;
  hasFullPrivilege: boolean;
}>;

type FilterRolesResponse = Nullish<{
  filterRoles: CursorPaginationReturnType<Role>;
}>;

type FilterRolesArgs = RoleFieldArgs & CursorPaginationArgs<RoleFilterInput>;

type CreateRoleResponse = Nullish<{
  createRole: Role;
}>;

interface CreateRoleArgs extends RoleFieldArgs {
  name: string;
  description?: string | null;
  hasFullPrivilege?: boolean | null;
  allowedResourceIds: string[] | null;
  intermediateResourceIds: string[] | null;
}

type UpdateRoleResponse = Nullish<{
  updateRole: Role;
}>;

interface UpdateRoleArgs extends Partial<CreateRoleArgs> {
  id: number;
}

type DeleteRoleResponse = Nullish<{
  deleteRole: string;
}>;

type DeleteRoleArgs = Nullish<{
  id: number;
}>;

type ACLTreeResponse = Nullish<{
  aclTree: ACL | null;
}>;

type ACLTreeArgs = Nullish<{
  isMyRole: boolean;
  isACLTreeAllowedResourceIdsNeed: boolean;
  isACLTreeResourceIdNeed: boolean;
}>;

const roleFormSchema = z.object({
  name: nameZodSchema(true),
  hasFullPrivilege: z.boolean(),
  description: z.string().nullish(),
});

type RoleForm = z.infer<typeof roleFormSchema>;

export { roleFormSchema };
export type {
  Role,
  RoleFieldArgs,
  RoleFilterInput,
  FilterRolesResponse,
  FilterRolesArgs,
  CreateRoleResponse,
  CreateRoleArgs,
  UpdateRoleResponse,
  UpdateRoleArgs,
  DeleteRoleResponse,
  DeleteRoleArgs,
  ACL,
  ResourceId,
  RoleForm,
  ACLTreeResponse,
  ACLTreeArgs,
};
