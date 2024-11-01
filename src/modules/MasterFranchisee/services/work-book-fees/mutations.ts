import { TypedDocumentNode, gql } from "@apollo/client";

import {
  GenerateMasterFranchiseeWorkbookCSVArgs,
  GenerateMasterFranchiseeWorkbookCSVResponse,
  UpdateMasterFranchiseeWorkBookFeeArgs,
  UpdateMasterFranchiseeWorkBookFeeResponse,
} from "modules/MasterFranchisee";

const UPDATE_MASTER_FRANCHISEE_WORK_BOOK_FEE: TypedDocumentNode<
  UpdateMasterFranchiseeWorkBookFeeResponse,
  UpdateMasterFranchiseeWorkBookFeeArgs
> = gql`
  mutation UpdateMasterFranchiseeWorkBookFee($id: Int!, $price: Float) {
    updateMasterFranchiseeWorkBookFee: updateMasterFranchiseeWorkBook(
      id: $id
      price: $price
    ) {
      id
      price
    }
  }
`;

const GENERATE_MASTER_FRANCHISEE_WORKBOOK_FEE_CSV: TypedDocumentNode<
  GenerateMasterFranchiseeWorkbookCSVResponse,
  GenerateMasterFranchiseeWorkbookCSVArgs
> = gql`
  mutation GenerateEducationalWorkbookCSV($masterFranchiseeId: Int!) {
    generateMFWorkbookCSV: generateMFWorkbookCSV(
      masterFranchiseeId: $masterFranchiseeId
    )
  }
`;

export {
  UPDATE_MASTER_FRANCHISEE_WORK_BOOK_FEE,
  GENERATE_MASTER_FRANCHISEE_WORKBOOK_FEE_CSV,
};
