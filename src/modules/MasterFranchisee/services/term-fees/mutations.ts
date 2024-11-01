import { TypedDocumentNode, gql } from "@apollo/client";

import {
  GenerateMasterFranchiseeTermsCSVArgs,
  GenerateMasterFranchiseeTermsCSVResponse,
  UpdateMasterFranchiseeTermFeeArgs,
  UpdateMasterFranchiseeTermFeeResponse,
} from "modules/MasterFranchisee";

const UPDATE_MASTER_FRANCHISEE_TERM_FEE: TypedDocumentNode<
  UpdateMasterFranchiseeTermFeeResponse,
  UpdateMasterFranchiseeTermFeeArgs
> = gql`
  mutation UpdateMasterFranchiseeTermFee($id: Int!, $price: Float) {
    updateMasterFranchiseeTermFee: updateMasterFranchiseeEducationalTerm(
      id: $id
      price: $price
    ) {
      id
      price
    }
  }
`;

const GENERATE_MASTER_FRANCHISEE_TERMS_FEE_CSV: TypedDocumentNode<
  GenerateMasterFranchiseeTermsCSVResponse,
  GenerateMasterFranchiseeTermsCSVArgs
> = gql`
  mutation GenerateMasterFranchiseeEducationalTermCSV(
    $masterFranchiseeId: Int!
  ) {
    generateMFEducationalTermCSV: generateMFEducationalTermCSV(
      masterFranchiseeId: $masterFranchiseeId
    )
  }
`;

export {
  UPDATE_MASTER_FRANCHISEE_TERM_FEE,
  GENERATE_MASTER_FRANCHISEE_TERMS_FEE_CSV,
};
