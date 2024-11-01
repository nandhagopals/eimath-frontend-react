import { gql } from "@apollo/client";

const WORKBOOK_INFORMATION_FRAGMENT = gql`
  fragment workbookInformationFragment on WorkbookInformation {
    id
    name
    price @include(if: $isPriceNeed)
    country @include(if: $isCountryDetailsNeed) {
      id
      name
      status
    }
    status @include(if: $isStatusNeed)
    remarks @include(if: $isRemarksNeed)
    workbookFiles @include(if: $isWorkbookFilesNeed) {
      id
      originalFileName
      fileURL
      mimeType
    }
    workbookAnswerFiles @include(if: $isWorkbookAnswerFilesNeed) {
      id
      originalFileName
      fileURL
      mimeType
    }
  }
`;

export { WORKBOOK_INFORMATION_FRAGMENT };
