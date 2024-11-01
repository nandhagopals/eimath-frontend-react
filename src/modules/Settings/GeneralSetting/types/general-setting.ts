import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterFloat,
  FilterInteger,
  Nullish,
} from "global/types";

type MasterGeneralSetting = Nullish<{
  id: number;
  enableGst: boolean;
  gstPercentage: number;
  pricePerPoint: number;
}>;

type MasterGeneralSettingFilterInput = Nullish<{
  id: FilterInteger;
  enableGst: boolean;
  gstPercentage: FilterFloat;
}>;

type FilterMasterGeneralSettingResponse = Nullish<{
  filterMasterGeneralSettings: CursorPaginationReturnType<MasterGeneralSetting>;
}>;

type FilterMasterGeneralSettingArgs =
  CursorPaginationArgs<MasterGeneralSettingFilterInput>;

export type {
  MasterGeneralSetting,
  MasterGeneralSettingFilterInput,
  FilterMasterGeneralSettingResponse,
  FilterMasterGeneralSettingArgs,
};
