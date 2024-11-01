import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CreateMasterFranchiseePointsTransactionArgs,
  CreateMasterFranchiseePointsTransactionResponse,
  GenerateMFPointCSV,
} from "modules/PointsManagement";

const CREATE_MASTER_FRANCHISEE_POINTS_TRANSACTION: TypedDocumentNode<
  CreateMasterFranchiseePointsTransactionResponse,
  CreateMasterFranchiseePointsTransactionArgs
> = gql`
  mutation CreateMasterFranchiseePointsTransaction(
    $masterFranchiseeInformationId: Int!
    $type: String!
    $points: Float!
    $remarks: String
  ) {
    createMasterFranchiseePointsTransaction(
      masterFranchiseeInformationId: $masterFranchiseeInformationId
      type: $type
      points: $points
      remarks: $remarks
    ) {
      id
      masterFranchiseePoint {
        id
        pointsAvailable
      }
    }
  }
`;

const GENERATE_MF_POINT_CSV: TypedDocumentNode<GenerateMFPointCSV> = gql`
  mutation GenerateMFPointCSV {
    generateMFPointCSV
  }
`;

export { CREATE_MASTER_FRANCHISEE_POINTS_TRANSACTION, GENERATE_MF_POINT_CSV };
