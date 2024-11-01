import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CreateEducationalTermArgs,
  CreateEducationalTermResponse,
  DeleteEducationalTermArgs,
  DeleteEducationalTermResponse,
  EDUCATIONAL_TERM_FRAGMENT,
  GenerateTermsCSVArgs,
  GenerateTermsCSVResponse,
  UpdateEducationalTermArgs,
  UpdateEducationalTermResponse,
} from "modules/EducationMaterials/Terms";

const CREATE_EDUCATIONAL_TERM: TypedDocumentNode<
  CreateEducationalTermResponse,
  CreateEducationalTermArgs
> = gql`
  ${EDUCATIONAL_TERM_FRAGMENT}
  mutation CreateEducationalTerm(
    $name: String!
    $price: Float!
    $countryId: Int!
    $remarks: String
    $workbookInformationIds: [Int]!
    $isCountryDetailsNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isRemarksNeed: Boolean = false
    $isPriceNeed: Boolean = false
    $isWorkBookInformationNeed: Boolean = false
  ) {
    createEducationalTerm(
      name: $name
      price: $price
      countryId: $countryId
      remarks: $remarks
      workbookInformationIds: $workbookInformationIds
    ) {
      ...educationalTermFragment
    }
  }
`;

const UPDATE_EDUCATIONAL_TERM: TypedDocumentNode<
  UpdateEducationalTermResponse,
  UpdateEducationalTermArgs
> = gql`
  ${EDUCATIONAL_TERM_FRAGMENT}
  mutation UpdateEducationalTerm(
    $id: Int!
    $name: String
    $countryId: Int
    $remarks: String
    $workbookInformationIds: [Int]
    $price: Float
    $status: String
    $isCountryDetailsNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isRemarksNeed: Boolean = false
    $isPriceNeed: Boolean = false
    $isWorkBookInformationNeed: Boolean = false
  ) {
    updateEducationalTerm(
      id: $id
      name: $name
      countryId: $countryId
      workbookInformationIds: $workbookInformationIds
      price: $price
      remarks: $remarks
      status: $status
    ) {
      ...educationalTermFragment
    }
  }
`;

const DELETE_EDUCATIONAL_TERM: TypedDocumentNode<
  DeleteEducationalTermResponse,
  DeleteEducationalTermArgs
> = gql`
  mutation DeleteEducationalTerm($id: Int!) {
    deleteEducationalTerm(id: $id)
  }
`;

const GENERATE_TERMS_CSV: TypedDocumentNode<
  GenerateTermsCSVResponse,
  GenerateTermsCSVArgs
> = gql`
  mutation GenerateEducationalTermCSV2($status: String) {
    generateTermsCSV: generateEducationalTermCSV(status: $status)
  }
`;

export {
  CREATE_EDUCATIONAL_TERM,
  UPDATE_EDUCATIONAL_TERM,
  DELETE_EDUCATIONAL_TERM,
  GENERATE_TERMS_CSV,
};
