import { gql } from "@apollo/client";

const SALES_REPORT_FRAGMENT = gql`
  fragment salesReportFragment on SalesReport {
    year
    totalAmount
  }
`;

export { SALES_REPORT_FRAGMENT };
