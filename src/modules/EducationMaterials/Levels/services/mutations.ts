import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CreateEducationalLevelArgs,
  CreateEducationalLevelResponse,
  DeleteEducationalLevelArgs,
  DeleteEducationalLevelResponse,
  EDUCATIONAL_LEVEL_FRAGMENT,
  GenerateLevelsCSVArgs,
  GenerateLevelsCSVResponse,
  UpdateEducationalLevelArgs,
  UpdateEducationalLevelResponse,
} from "modules/EducationMaterials/Levels";

const CREATE_EDUCATIONAL_LEVEL: TypedDocumentNode<
  CreateEducationalLevelResponse,
  CreateEducationalLevelArgs
> = gql`
  ${EDUCATIONAL_LEVEL_FRAGMENT}
  mutation CreateEducationalLevel(
    $name: String!
    $countryId: Int!
    $remarks: String
    $educationalTerms: [CreateEducationalLevelTerm]!
    $isCountryDetailsNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isRemarksNeed: Boolean = false
    $isEducationalTermsNeed: Boolean = false
  ) {
    createEducationalLevel(
      name: $name
      countryId: $countryId
      remarks: $remarks
      educationalTerms: $educationalTerms
    ) {
      ...educationalLevelFragment
    }
  }
`;

const UPDATE_EDUCATIONAL_LEVEL: TypedDocumentNode<
  UpdateEducationalLevelResponse,
  UpdateEducationalLevelArgs
> = gql`
  ${EDUCATIONAL_LEVEL_FRAGMENT}
  mutation UpdateEducationalLevel(
    $id: Int!
    $name: String
    $countryId: Int
    $remarks: String
    $educationalTerms: [UpdateEducationalLevelTerm]
    $status: String
    $isCountryDetailsNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isRemarksNeed: Boolean = false
    $isEducationalTermsNeed: Boolean = false
  ) {
    updateEducationalLevel(
      id: $id
      name: $name
      remarks: $remarks
      countryId: $countryId
      educationalTerms: $educationalTerms
      status: $status
    ) {
      ...educationalLevelFragment
    }
  }
`;

const DELETE_EDUCATIONAL_LEVEL: TypedDocumentNode<
  DeleteEducationalLevelResponse,
  DeleteEducationalLevelArgs
> = gql`
  mutation DeleteEducationalLevel($id: Int!) {
    deleteEducationalLevel(id: $id)
  }
`;

const GENERATE_LEVELS_CSV: TypedDocumentNode<
  GenerateLevelsCSVResponse,
  GenerateLevelsCSVArgs
> = gql`
  mutation GenerateLevelsCSV($status: String) {
    generateLevelsCSV: generateEducationalLevelCSV(status: $status)
  }
`;

export {
  CREATE_EDUCATIONAL_LEVEL,
  UPDATE_EDUCATIONAL_LEVEL,
  DELETE_EDUCATIONAL_LEVEL,
  GENERATE_LEVELS_CSV,
};
