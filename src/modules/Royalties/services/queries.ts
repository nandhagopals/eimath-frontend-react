import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterHQRoyaltiesArgs,
  FilterHQRoyaltiesResponse,
  HQ_ROYALTY_FRAGMENT,
  FilterMasterFranchiseeRoyaltiesArgs,
  FilterMasterFranchiseeRoyaltiesResponse,
  MASTER_FRANCHISEE_ROYALTY_FRAGMENT,
  MASTER_FRANCHISEE_ROYALTY_TRANSACTION_FRAGMENT,
  FilterMasterFranchiseeRoyaltiesByMFArgs,
  FilterMasterFranchiseeRoyaltiesByMFResponse,
  FilterMasterFranchiseeRoyaltyTransactionsArgs,
  FilterMasterFranchiseeRoyaltyTransactionsResponse,
  GenerateRoyaltyPaymentSummaryPDFArgs,
  GenerateRoyaltyPaymentSummaryPDFResponse,
  GenerateRoyaltyReceiptPDFArgs,
  GenerateRoyaltyReceiptPDFResponse,
} from "modules/Royalties";

const FILTER_HQ_ROYALTIES: TypedDocumentNode<
  FilterHQRoyaltiesResponse,
  FilterHQRoyaltiesArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${HQ_ROYALTY_FRAGMENT}
  query FilterHQRoyalties(
    $filter: HQRoyaltyFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isHQRoyaltyMasterFranchiseeInformationNeed: Boolean = false
    $isRevenueNeed: Boolean = false
    $isEarningNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isMonthNeed: Boolean = false
    $isYearNeed: Boolean = false
    $isPaymentIdNeed: Boolean = false
    $isReceiptIdNeed: Boolean = false
    $isPaymentSummaryURLNeed: Boolean = false
    $isReceiptURLNeed: Boolean = false
  ) {
    filterHQRoyalties(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...hqRoyaltyFragment
        }
        cursor
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

const FILTER_MASTER_FRANCHISEE_ROYALTIES: TypedDocumentNode<
  FilterMasterFranchiseeRoyaltiesResponse,
  FilterMasterFranchiseeRoyaltiesArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${MASTER_FRANCHISEE_ROYALTY_FRAGMENT}
  query FilterMasterFranchiseeRoyalties(
    $filter: MasterFranchiseeRoyaltyFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isMasterFranchiseeRoyaltyFranchiseeInformationNeed: Boolean = false
    $isMasterFranchiseeRoyaltyMasterFranchiseeRoyaltyTransactionsNeed: Boolean = false
    $isRevenueNeed: Boolean = false
    $isEarningNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isMonthNeed: Boolean = false
    $isYearNeed: Boolean = false
    $isPaymentIdNeed: Boolean = false
    $isReceiptIdNeed: Boolean = false
    $isPaymentSummaryURLNeed: Boolean = false
    $isReceiptURLNeed: Boolean = false
  ) {
    filterMasterFranchiseeRoyalties(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...masterFranchiseeRoyaltyFragment
        }
        cursor
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

const FILTER_MASTER_FRANCHISEE_ROYALTIES_BY_MF: TypedDocumentNode<
  FilterMasterFranchiseeRoyaltiesByMFResponse,
  FilterMasterFranchiseeRoyaltiesByMFArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${MASTER_FRANCHISEE_ROYALTY_FRAGMENT}
  query FilterMasterFranchiseeRoyaltiesByMF(
    $hqRoyaltyId: Int!
    $filter: MFAndFranchiseeFilterInput
    $sortBy: sortBy
    $pagination: Pagination
    $isMasterFranchiseeRoyaltyFranchiseeInformationNeed: Boolean = false
    $isMasterFranchiseeRoyaltyMasterFranchiseeRoyaltyTransactionsNeed: Boolean = false
    $isRevenueNeed: Boolean = false
    $isEarningNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isMonthNeed: Boolean = false
    $isYearNeed: Boolean = false
    $isPaymentIdNeed: Boolean = false
    $isReceiptIdNeed: Boolean = false
    $isPaymentSummaryURLNeed: Boolean = false
    $isReceiptURLNeed: Boolean = false
  ) {
    filterMasterFranchiseeRoyaltiesByMF: getMasterFranchiseeRoyaltiesByMF(
      hqRoyaltyId: $hqRoyaltyId
      filter: $filter
      sortBy: $sortBy
      pagination: $pagination
    ) {
      dataCollection {
        edges {
          node {
            ...masterFranchiseeRoyaltyFragment
          }
        }
        pageInfo {
          ...paginationInfoFragment
        }
      }
      totalFranchisee
      totalReceipts
      totalRoyaltiesCollected
      totalEarnings
    }
  }
`;

const FILTER_FRANCHISEE_ROYALTY_TRANSACTIONS: TypedDocumentNode<
  FilterMasterFranchiseeRoyaltyTransactionsResponse,
  FilterMasterFranchiseeRoyaltyTransactionsArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${MASTER_FRANCHISEE_ROYALTY_TRANSACTION_FRAGMENT}
  query FilterFranchiseeRoyaltyTransactions(
    $filter: MasterFranchiseeRoyaltyTransactionFilterInput
    $masterFranchiseeInformationId: Int
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isMonthNeed: Boolean = false
    $isYearNeed: Boolean = false
    $isRevenueNeed: Boolean = false
    $isMasterFranchiseeRoyaltyNeed: Boolean = false
    $isStudentNeed: Boolean = false
  ) {
    filterMasterFranchiseeRoyaltyTransactions(
      filter: $filter
      masterFranchiseeId: $masterFranchiseeInformationId
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...masterFranchiseeRoyaltyTransactionFragment
        }
        cursor
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

const GENERATE_ROYALTY_RECEIPT_PDF: TypedDocumentNode<
  GenerateRoyaltyReceiptPDFResponse,
  GenerateRoyaltyReceiptPDFArgs
> = gql`
  query GenerateRoyaltyReceiptPdf(
    $masterFranchiseeRoyaltyId: Int
    $hqRoyaltyId: Int
  ) {
    generateRoyaltyReceiptPdf(
      masterFranchiseeRoyaltyId: $masterFranchiseeRoyaltyId
      hqRoyaltyId: $hqRoyaltyId
    ) {
      filePath
    }
  }
`;

const GENERATE_ROYALTY_PAYMENT_SUMMARY_PDF: TypedDocumentNode<
  GenerateRoyaltyPaymentSummaryPDFResponse,
  GenerateRoyaltyPaymentSummaryPDFArgs
> = gql`
  query GenerateRoyaltyPaymentSummaryPdf(
    $hqRoyaltyId: Int
    $masterFranchiseeRoyaltyId: Int
  ) {
    generateRoyaltyPaymentSummaryPdf(
      hqRoyaltyId: $hqRoyaltyId
      masterFranchiseeRoyaltyId: $masterFranchiseeRoyaltyId
    ) {
      filePath
    }
  }
`;

export {
  FILTER_HQ_ROYALTIES,
  FILTER_MASTER_FRANCHISEE_ROYALTIES,
  FILTER_MASTER_FRANCHISEE_ROYALTIES_BY_MF,
  GENERATE_ROYALTY_RECEIPT_PDF,
  GENERATE_ROYALTY_PAYMENT_SUMMARY_PDF,
  FILTER_FRANCHISEE_ROYALTY_TRANSACTIONS,
};
