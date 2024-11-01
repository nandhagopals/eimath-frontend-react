import { gql } from "@apollo/client";

const GENERAL_SETTING_FRAGMENT = gql`
  fragment generalSettingFragment on MasterGeneralSetting {
    id
    enableGst
    gstPercentage
    pricePerPoint
  }
`;

export { GENERAL_SETTING_FRAGMENT };
