import { gql } from "@apollo/client";

const MASTER_FRANCHISEE_GENERAL_FRAGMENT = gql`
  fragment masterFranchiseeGeneralFragment on MasterFranchiseeGeneral {
    id
    gstPercentage @include(if: $isMasterFranchiseeGeneralGSTPercentageNeed)
    registrationFee @include(if: $isMasterFranchiseeGeneralRegistrationFeeNeed)
    depositFee @include(if: $isMasterFranchiseeGeneralDepositFeeNeed)
    staffEmail @include(if: $isMasterFranchiseeGeneralStaffEmailNeed)
    staffPassword @include(if: $isMasterFranchiseeGeneralStaffPasswordNeed)
    enableGST: enableGst @include(if: $isMasterFranchiseeGeneralEnableGSTNeed)
  }
`;

export { MASTER_FRANCHISEE_GENERAL_FRAGMENT };
