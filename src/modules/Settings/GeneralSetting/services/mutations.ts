import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CreateMasterGeneralSettingArgs,
  CreateMasterGeneralSettingResponse,
  GENERAL_SETTING_FRAGMENT,
  UpdateMasterGeneralSettingArgs,
  UpdateMasterGeneralSettingResponse,
} from "modules/Settings/GeneralSetting";

const CREATE_MASTER_GENERAL_SETTING: TypedDocumentNode<
  CreateMasterGeneralSettingResponse,
  CreateMasterGeneralSettingArgs
> = gql`
  ${GENERAL_SETTING_FRAGMENT}
  mutation CreateMasterGeneralSetting(
    $enableGst: Boolean!
    $gstPercentage: Float!
    $pricePerPoint: Float!
  ) {
    createMasterGeneralSetting(
      enableGst: $enableGst
      gstPercentage: $gstPercentage
      pricePerPoint: $pricePerPoint
    ) {
      ...generalSettingFragment
    }
  }
`;

const UPDATE_MASTER_GENERAL_SETTING: TypedDocumentNode<
  UpdateMasterGeneralSettingResponse,
  UpdateMasterGeneralSettingArgs
> = gql`
  ${GENERAL_SETTING_FRAGMENT}
  mutation UpdateMasterGeneralSetting(
    $id: Int!
    $enableGst: Boolean
    $gstPercentage: Float
    $pricePerPoint: Float
  ) {
    updateMasterGeneralSetting(
      id: $id
      enableGst: $enableGst
      gstPercentage: $gstPercentage
      pricePerPoint: $pricePerPoint
    ) {
      ...generalSettingFragment
    }
  }
`;

export { CREATE_MASTER_GENERAL_SETTING, UPDATE_MASTER_GENERAL_SETTING };
