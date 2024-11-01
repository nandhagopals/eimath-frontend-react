import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CreateEducationalCategoryArgs,
  CreateEducationalCategoryResponse,
  DeleteEducationalCategoryArgs,
  DeleteEducationalCategoryResponse,
  GenerateEducationalCategoryCSVArgs,
  GenerateEducationalCategoryCSVResponse,
  UpdateEducationalCategoryArgs,
  UpdateEducationalCategoryResponse,
} from "modules/EducationMaterials/EducationalCategory";

const CREATE_EDUCATIONAL_CATEGORY: TypedDocumentNode<
  CreateEducationalCategoryResponse,
  CreateEducationalCategoryArgs
> = gql`
  mutation CreateEducationalCategory(
    $name: String!
    $countryId: Int!
    $educationalLevels: [CreateEducationalCategoryLevel]!
    $remarks: String
  ) {
    createEducationalCategory(
      name: $name
      countryId: $countryId
      educationalLevels: $educationalLevels
      remarks: $remarks
    ) {
      id
    }
  }
`;

const UPDATE_EDUCATIONAL_CATEGORY: TypedDocumentNode<
  UpdateEducationalCategoryResponse,
  UpdateEducationalCategoryArgs
> = gql`
  mutation UpdateEducationalCategory(
    $id: Int!
    $name: String
    $countryId: Int
    $remarks: String
    $status: String
    $educationalLevels: [UpdateEducationalCategoryLevel]
    $isEducationalCategoryStatusNeed: Boolean = false
  ) {
    updateEducationalCategory(
      id: $id
      name: $name
      countryId: $countryId
      remarks: $remarks
      status: $status
      educationalLevels: $educationalLevels
    ) {
      id
      status @include(if: $isEducationalCategoryStatusNeed)
    }
  }
`;

const DELETE_EDUCATIONAL_CATEGORY: TypedDocumentNode<
  DeleteEducationalCategoryResponse,
  DeleteEducationalCategoryArgs
> = gql`
  mutation DeleteEducationalCategory($id: Int!) {
    deleteEducationalCategory(id: $id)
  }
`;

const GENERATE_EDUCATIONAL_CATEGORY_CSV: TypedDocumentNode<
  GenerateEducationalCategoryCSVResponse,
  GenerateEducationalCategoryCSVArgs
> = gql`
  mutation GenerateEducationalCategoryCSV($status: String) {
    generateEducationalCategoryCSV(status: $status)
  }
`;

export {
  CREATE_EDUCATIONAL_CATEGORY,
  UPDATE_EDUCATIONAL_CATEGORY,
  DELETE_EDUCATIONAL_CATEGORY,
  GENERATE_EDUCATIONAL_CATEGORY_CSV,
};
