import { TypedDocumentNode, gql } from "@apollo/client";

import {
  GenerateMasterFranchiseeProductCSVArgs,
  GenerateMasterFranchiseeProductCSVResponse,
  UpdateMasterFranchiseeProductFeeArgs,
  UpdateMasterFranchiseeProductFeeResponse,
} from "modules/MasterFranchisee";

const UPDATE_MASTER_FRANCHISEE_PRODUCT_FEE: TypedDocumentNode<
  UpdateMasterFranchiseeProductFeeResponse,
  UpdateMasterFranchiseeProductFeeArgs
> = gql`
  mutation UpdateMasterFranchiseeProductFee($id: Int!, $price: Float) {
    updateMasterFranchiseeProductFee: updateMasterFranchiseeProduct(
      id: $id
      price: $price
    ) {
      id
      price
    }
  }
`;

const GENERATE_MASTER_FRANCHISEE_PRODUCT_FEE_CSV: TypedDocumentNode<
  GenerateMasterFranchiseeProductCSVResponse,
  GenerateMasterFranchiseeProductCSVArgs
> = gql`
  mutation GenerateMasterFranchiseeProductCSV($masterFranchiseeId: Int!) {
    generateMFProductCSV: generateMFProductCSV(
      masterFranchiseeId: $masterFranchiseeId
    )
  }
`;

export {
  UPDATE_MASTER_FRANCHISEE_PRODUCT_FEE,
  GENERATE_MASTER_FRANCHISEE_PRODUCT_FEE_CSV,
};
