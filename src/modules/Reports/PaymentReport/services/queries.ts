import { TypedDocumentNode, gql } from "@apollo/client";
import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterPaymentReportsArgs,
  FilterPaymentReportsResponse,
  PAYMENT_REPORT_FRAGMENT,
} from "modules/Reports/PaymentReport";

const FILTER_PAYMENT_REPORTS: TypedDocumentNode<
  FilterPaymentReportsResponse,
  FilterPaymentReportsArgs
> = gql`
  ${PAYMENT_REPORT_FRAGMENT}
  ${PAGINATION_INFO_FRAGMENT}
  query GeneratePaymentReport(
    $month: String!
    $sortBy: sortBy
    $pagination: Pagination
  ) {
    filterPaymentReports: generatePaymentReport(
      month: $month
      sortBy: $sortBy
      pagination: $pagination
    ) {
      dataCollection {
        edges {
          node {
            ...paymentReportFragment
          }
        }
        pageInfo {
          ...paginationInfoFragment
        }
      }
      paidAmount
      unpaidAmount
      csvFilePath
    }
  }
`;

export { FILTER_PAYMENT_REPORTS };
