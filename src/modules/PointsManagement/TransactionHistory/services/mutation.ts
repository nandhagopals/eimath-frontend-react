import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CreateMasterFranchiseePointsPurchaseArgs,
  CreateMasterFranchiseePointsPurchaseResponse,
  GenerateMFPointsTransactionCSVResponse,
  UpdateMasterFranchiseePointsPurchaseResponse,
  DeleteMasterFranchiseePointsPurchaseResponse,
  DeleteMasterFranchiseePointsPurchaseArg,
  UpdateMasterFranchiseePointsPurchaseArg,
  MakeOnlinePaymentResponse,
  MakeOnlinePaymentArgs,
} from "modules/PointsManagement";

const CREATE_MASTER_FRANCHISEE_POINTS_PURCHASE: TypedDocumentNode<
  CreateMasterFranchiseePointsPurchaseResponse,
  CreateMasterFranchiseePointsPurchaseArgs
> = gql`
  mutation CreateMasterFranchiseePointsPurchase(
    $masterFranchiseeInformationId: Int!
    $numberOfPoints: Int!
  ) {
    createMasterFranchiseePointsPurchase(
      masterFranchiseeInformationId: $masterFranchiseeInformationId
      numberOfPoints: $numberOfPoints
    ) {
      id
      totalPayable
      numberOfPoints
    }
  }
`;

const UPDATE_MASTER_FRANCHISEE_POINTS_PURCHASE: TypedDocumentNode<
  UpdateMasterFranchiseePointsPurchaseResponse,
  UpdateMasterFranchiseePointsPurchaseArg
> = gql`
  mutation UpdateMasterFranchiseePointsPurchase(
    $id: Int!
    $paymentMethod: String
  ) {
    updateMasterFranchiseePointsPurchase(
      id: $id
      paymentMethod: $paymentMethod
    ) {
      id
      paymentMethod
      totalPayable
    }
  }
`;

const DELETE_MASTER_FRANCHISEE_POINTS_PURCHASE: TypedDocumentNode<
  DeleteMasterFranchiseePointsPurchaseResponse,
  DeleteMasterFranchiseePointsPurchaseArg
> = gql`
  mutation DeleteMasterFranchiseePointsPurchase($id: Int!) {
    deleteMasterFranchiseePointsPurchase(id: $id)
  }
`;

const GENERATE_MF_POINTS_TRANSACTION_CSV: TypedDocumentNode<GenerateMFPointsTransactionCSVResponse> = gql`
  mutation GenerateMFPointsTransactionCSV {
    generateMFPointsTransactionCSV
  }
`;

const MAKE_ONLINE_PAYMENT: TypedDocumentNode<
  MakeOnlinePaymentResponse,
  MakeOnlinePaymentArgs
> = gql`
  mutation MakeOnlinePayment($masterFranchiseePointsPurchaseId: Int!) {
    makeOnlinePayment(
      masterFranchiseePointsPurchaseId: $masterFranchiseePointsPurchaseId
    ) {
      id
      paymentURL
    }
  }
`;

export {
  CREATE_MASTER_FRANCHISEE_POINTS_PURCHASE,
  UPDATE_MASTER_FRANCHISEE_POINTS_PURCHASE,
  DELETE_MASTER_FRANCHISEE_POINTS_PURCHASE,
  GENERATE_MF_POINTS_TRANSACTION_CSV,
  MAKE_ONLINE_PAYMENT,
};
