import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";
import {
  FilterMasterGeneralSettingArgs,
  FilterMasterGeneralSettingResponse,
  GENERAL_SETTING_FRAGMENT,
} from "modules/Settings/GeneralSetting";

const FILTER_MASTER_GENERAL_SETTING: TypedDocumentNode<
  FilterMasterGeneralSettingResponse,
  FilterMasterGeneralSettingArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${GENERAL_SETTING_FRAGMENT}
  query FilterMasterGeneralSettings(
    $filter: MasterGeneralSettingFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
  ) {
    filterMasterGeneralSettings(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...generalSettingFragment
        }
        cursor
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_MASTER_GENERAL_SETTING };
