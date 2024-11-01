type AllAllowedResourceReturnType = {
  canRead: boolean;
    canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

type AllowedResourceReturnType<T> = T extends true
  ? AllAllowedResourceReturnType
  : boolean;

type UseFindIsResourceIdsHasCheckedArgs =
  | string[]
  | { text: string; getCRUDOperation: boolean }
  | { text: string; getProfileCRUDOperation: boolean };

type UseFindIsResourceIdsHasCheckedReturnType<
  T extends UseFindIsResourceIdsHasCheckedArgs = string[]
> = T extends string[]
  ? boolean
  : {
      canRead: boolean;
      canCreate: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    };

export type {
  AllowedResourceReturnType,
  UseFindIsResourceIdsHasCheckedArgs,
  UseFindIsResourceIdsHasCheckedReturnType,
};
