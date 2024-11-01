import { TypedDocumentNode, gql } from "@apollo/client";

import {
  MASTER_FRANCHISEE_GENERAL_FRAGMENT,
  UpdateMasterFranchiseeGeneralArgs,
  UpdateMasterFranchiseeGeneralResponse,
} from "modules/MasterFranchisee";

const UPDATE_MASTER_FRANCHISEE_GENERAL: TypedDocumentNode<
  UpdateMasterFranchiseeGeneralResponse,
  UpdateMasterFranchiseeGeneralArgs
> = gql`
  ${MASTER_FRANCHISEE_GENERAL_FRAGMENT}
  mutation UpdateMasterFranchiseeGeneral(
    $id: Int!
    $enableGST: Boolean
    $registrationFee: Float
    $gstPercentage: Float
    $depositFee: Float
    $staffEmail: String
    $staffPassword: String
    $isMasterFranchiseeGeneralGSTPercentageNeed: Boolean = false
    $isMasterFranchiseeGeneralRegistrationFeeNeed: Boolean = false
    $isMasterFranchiseeGeneralDepositFeeNeed: Boolean = false
    $isMasterFranchiseeGeneralStaffEmailNeed: Boolean = false
    $isMasterFranchiseeGeneralStaffPasswordNeed: Boolean = false
    $isMasterFranchiseeGeneralEnableGSTNeed: Boolean = false
  ) {
    updateMasterFranchiseeGeneral(
      id: $id
      enableGst: $enableGST
      registrationFee: $registrationFee
      gstPercentage: $gstPercentage
      depositFee: $depositFee
      staffEmail: $staffEmail
      staffPassword: $staffPassword
    ) {
      ...masterFranchiseeGeneralFragment
    }
  }
`;

export { UPDATE_MASTER_FRANCHISEE_GENERAL };
