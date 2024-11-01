import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  WORKBOOK_INFORMATION_FRAGMENT,
  type FilterWorkbookInformationArgs,
  type FilterWorkbookInformationResponse,
} from "modules/EducationMaterials/WorkbookManagement";

const FILTER_WORKBOOK_INFORMATION: TypedDocumentNode<
  FilterWorkbookInformationResponse,
  FilterWorkbookInformationArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${WORKBOOK_INFORMATION_FRAGMENT}
  query FilterWorkbookInformation(
    $filter: WorkbookInformationFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isPriceNeed: Boolean = false
    $isCountryDetailsNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isRemarksNeed: Boolean = false
    $isWorkbookFilesNeed: Boolean = false
    $isWorkbookAnswerFilesNeed: Boolean = false
  ) {
    filterWorkbookInformation(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...workbookInformationFragment
        }
        cursor
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_WORKBOOK_INFORMATION };
