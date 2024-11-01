import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  HQRoyaltyReportArgs,
  HQRoyaltyReportResponse,
  MFRoyaltyReportArgs,
  MFRoyaltyReportResponse,
} from "modules/Reports/RoyaltiesReport";

const HQ_ROYALTY_REPORT: TypedDocumentNode<
  HQRoyaltyReportResponse,
  HQRoyaltyReportArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  query GenerateHQRoyaltyReport(
    $fromDate: String!
    $toDate: String!
    # $masterFranchiseeId: Int
    $sortBy: sortBy
    $pagination: Pagination
  ) {
    generateHQRoyaltyReport(
      fromDate: $fromDate
      toDate: $toDate
      # masterFranchiseeId: $masterFranchiseeId
      sortBy: $sortBy
      pagination: $pagination
    ) {
      totalRevenue
      dataCollection {
        edges {
          node {
            id
            masterFranchiseeInformation {
              masterFranchiseeName
              prefix
            }
            paidAt
            revenue
            year
          }
        }
        pageInfo {
          ...paginationInfoFragment
        }
      }
      csvFilePath
    }
  }
`;

const MF_ROYALTY_REPORT: TypedDocumentNode<
  MFRoyaltyReportResponse,
  MFRoyaltyReportArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  query GenerateMFRoyaltyReport(
    $fromDate: String!
    $toDate: String!
    # $franchiseeId: Int
    $sortBy: sortBy
    $pagination: Pagination
  ) {
    generateMFRoyaltyReport(
      fromDate: $fromDate
      toDate: $toDate
      # franchiseeId: $franchiseeId
      sortBy: $sortBy
      pagination: $pagination
    ) {
      dataCollection {
        edges {
          node {
            id
            franchiseeInformation {
              franchiseeName
              prefix
            }
            paidAt
            revenue
            year
          }
        }
        pageInfo {
          ...paginationInfoFragment
        }
      }
      totalRevenue
      csvFilePath
    }
  }
`;

export { HQ_ROYALTY_REPORT, MF_ROYALTY_REPORT };
