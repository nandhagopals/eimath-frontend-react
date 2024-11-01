import { TypedDocumentNode, gql } from "@apollo/client";

import {
  WORKBOOK_INFORMATION_FRAGMENT,
  CreateWorkbookInformationArgs,
  CreateWorkbookInformationResponse,
  DeleteWorkbookInformationResponse,
  UpdateWorkbookInformationArgs,
  UpdateWorkbookInformationResponse,
  DeleteWorkbookInformationArgs,
  GenerateWorkbookInformationCSVResponse,
  GenerateWorkbookInformationCSVArgs,
} from "modules/EducationMaterials/WorkbookManagement";

const CREATE_WORKBOOK_INFORMATION: TypedDocumentNode<
  CreateWorkbookInformationResponse,
  CreateWorkbookInformationArgs
> = gql`
  ${WORKBOOK_INFORMATION_FRAGMENT}
  mutation CreateWorkbookInformation(
    $name: String!
    $price: Float!
    $countryId: Int!
    $remarks: String
    $workbookFiles: [Upload]
    $workbookAnswerFiles: [Upload]
    $isPriceNeed: Boolean = false
    $isCountryDetailsNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isRemarksNeed: Boolean = false
    $isWorkbookFilesNeed: Boolean = false
    $isWorkbookAnswerFilesNeed: Boolean = false
  ) {
    createWorkbookInformation(
      name: $name
      countryId: $countryId
      price: $price
      remarks: $remarks
      workbookFiles: $workbookFiles
      workbookAnswerFiles: $workbookAnswerFiles
    ) {
      ...workbookInformationFragment
    }
  }
`;

const UPDATE_WORKBOOK_INFORMATION: TypedDocumentNode<
  UpdateWorkbookInformationResponse,
  UpdateWorkbookInformationArgs
> = gql`
  ${WORKBOOK_INFORMATION_FRAGMENT}
  mutation UpdateWorkbookInformation(
    $id: Int!
    $name: String
    $price: Float
    $countryId: Int
    $remarks: String
    $workbookFiles: [Upload]
    $workbookAnswerFiles: [Upload]
    $status: String
    $isPriceNeed: Boolean = false
    $isCountryDetailsNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isRemarksNeed: Boolean = false
    $isWorkbookFilesNeed: Boolean = false
    $isWorkbookAnswerFilesNeed: Boolean = false
  ) {
    updateWorkbookInformation(
      id: $id
      name: $name
      countryId: $countryId
      price: $price
      remarks: $remarks
      workbookFiles: $workbookFiles
      workbookAnswerFiles: $workbookAnswerFiles
      status: $status
    ) {
      ...workbookInformationFragment
    }
  }
`;

const DELETE_WORKBOOK_INFORMATION: TypedDocumentNode<
  DeleteWorkbookInformationResponse,
  DeleteWorkbookInformationArgs
> = gql`
  mutation DeleteWorkbookInformation($id: Int!) {
    deleteWorkbookInformation(id: $id)
  }
`;

const GENERATE_WORKBOOK_INFORMATION_CSV: TypedDocumentNode<
  GenerateWorkbookInformationCSVResponse,
  GenerateWorkbookInformationCSVArgs
> = gql`
  mutation GenerateWorkbookCSV($status: String) {
    generateWorkbookInformationCSV(status: $status)
  }
`;

export {
  CREATE_WORKBOOK_INFORMATION,
  UPDATE_WORKBOOK_INFORMATION,
  DELETE_WORKBOOK_INFORMATION,
  GENERATE_WORKBOOK_INFORMATION_CSV,
};
