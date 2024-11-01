import { gql } from "@apollo/client";

const PAYMENT_REPORT_FRAGMENT = gql`
  fragment paymentReportFragment on Invoice {
    id
    invoiceId
    status
    orderingPartyStudent {
      masterFranchiseeInformation {
        masterFranchiseeName
      }
    }
    orderingPartyMF {
      masterFranchiseeName
    }
    orderingPartyFranchisee {
      masterFranchiseeInformation {
        masterFranchiseeName
      }
    }
    orderingPartyName
    total
    createdAt
  }
`;

export { PAYMENT_REPORT_FRAGMENT };
