import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterInvoicesArgs,
  FilterInvoicesResponse,
  FilterStudentRemarksArgs,
  FilterStudentRemarksResponse,
  FilterStudentsArgs,
  FilterStudentsResponse,
  GenerateInvoiceReceiptPDFArgs,
  GenerateInvoicePdfResponse,
  GetStudentKinRelationshipResponse,
  INVOICE_FRAGMENT,
  STUDENT_FRAGMENT,
  STUDENT_REMARKS_FRAGMENT,
} from "modules/Students";

const FILTER_STUDENTS: TypedDocumentNode<
  FilterStudentsResponse,
  FilterStudentsArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${STUDENT_FRAGMENT}
  query FilterStudents(
    $filter: StudentFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $excludeInProgressStudentRenewal: Boolean = false
    # StudentKinFieldArgs
    $isStudentKinRelationshipNeed: Boolean = false
    $isStudentKinIsPrimaryContactNeed: Boolean = false
    $isStudentKinIsdCodeNeed: Boolean = false
    $isStudentKinMobileNumberNeed: Boolean = false
    $isStudentKinEmailNeed: Boolean = false
    $isStudentKinAddressNeed: Boolean = false
    $isStudentKinPostalCodeNeed: Boolean = false
    $isStudentKinISDCountryNeed: Boolean = false
    $isStudentKinPostalCountryNeed: Boolean = false
    # StudentFieldArgs
    $isStudentStatusNeed: Boolean = false
    $isStudentStudentKinsNeed: Boolean = false
    $isStudentStudentRemarksNeed: Boolean = false
    $isStudentEducationalTermNeed: Boolean = false
    $isStudentEducationalLevelNeed: Boolean = false
    $isStudentMasterFranchiseeInformationNeed: Boolean = false
    $isStudentMasterFranchiseeInformationWorkbooksNeed: Boolean = false
    $isStudentFranchiseeNeed: Boolean = false
    $isStudentCreatedByUserNeed: Boolean = false
    $isStudentCreatedByMFNeed: Boolean = false
    $isStudentCreatedByFranchiseeNeed: Boolean = false
    $isStudentGraduatedAtNeed: Boolean = false
    $isStudentStudentDiscountsNeed: Boolean = false
    $isStudentPrimaryKinNeed: Boolean = false
    $isStudentHasDiscountNeed: Boolean = false
    $isStudentEducationalCategoryNeed: Boolean = false
    $isStudentNextEducationalLevelNeed: Boolean = false
    $isStudentNextEducationalTermNeed: Boolean = false
    $isStudentNextEducationalTermWorkbooksNeed: Boolean = false
    $isStudentWithdrawRemarkNeed: Boolean = false
    $isStudentWithdrawnAtNeed: Boolean = false
    $isStudentJoinedAtNeed: Boolean = false
  ) {
    filterStudents(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
      excludeInProgressStudentRenewal: $excludeInProgressStudentRenewal
    ) {
      edges {
        node {
          ...studentFragment
        }
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

const FILTER_STUDENT_REMARKS: TypedDocumentNode<
  FilterStudentRemarksResponse,
  FilterStudentRemarksArgs
> = gql`
  ${STUDENT_REMARKS_FRAGMENT}
  ${PAGINATION_INFO_FRAGMENT}
  query FilterStudentRemarks(
    $filter: StudentRemarkFilterInput
    $pagination: Pagination
  ) {
    filterStudentRemarks(filter: $filter, pagination: $pagination) {
      edges {
        node {
          ...studentRemarksFragment
        }
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

const FILTER_INVOICES: TypedDocumentNode<
  FilterInvoicesResponse,
  FilterInvoicesArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${INVOICE_FRAGMENT}
  query FilterInvoices(
    $filter: InvoiceFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isInvoiceStudentNeed: Boolean = false
    $isInvoiceInvoiceItemsNeed: Boolean = false
    $isInvoiceTotalNeed: Boolean = false
    $isInvoiceRemarksNeed: Boolean = false
    $isInvoiceInvoiceDiscountsNeed: Boolean = false
    $isInvoiceSubtotalNeed: Boolean = false
    $isInvoiceGSTAmountNeed: Boolean = false
    $isInvoiceOrderingPartyNameNeed: Boolean = false
    $isInvoiceOrderingPartyStudentNeed: Boolean = false
    $isInvoiceOrderingPartyFranchiseeNeed: Boolean = false
    $isInvoiceOrderingPartyMFNeed: Boolean = false
    $isInvoiceOrderingPartyEmailNeed: Boolean = false
    $isInvoiceInvoiceIdNeed: Boolean = false
    $isInvoiceCreatedAtNeed: Boolean = false
    $isInvoiceUpdatedAtNeed: Boolean = false
    $isInvoiceStatusNeed: Boolean = false
    $isInvoiceDiscountAmountNeed: Boolean = false
    $isInvoicePaymentMethodNeed: Boolean = false
    $isInvoiceCategoryNeed: Boolean = false
    $isInvoiceReceiptIdNeed: Boolean = false
    $isInvoiceInvoiceFileURLNeed: Boolean = false
    $isInvoiceHasDiscountNeed: Boolean = false
    $isInvoiceTypeNeed: Boolean = false
  ) {
    filterInvoices(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...invoiceFragment
        }
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

const GET_STUDENT_KIN_RELATIONSHIP: TypedDocumentNode<GetStudentKinRelationshipResponse> = gql`
  query GetStudentKinRelationship {
    getStudentKinRelationship
  }
`;

const GENERATE_INVOICE_PDF: TypedDocumentNode<
  GenerateInvoicePdfResponse,
  GenerateInvoiceReceiptPDFArgs
> = gql`
  query GenerateInvoicePdf($invoiceId: Int!) {
    generateInvoicePdf(invoiceId: $invoiceId) {
      fileName
      filePath
    }
  }
`;

export {
  FILTER_STUDENTS,
  GET_STUDENT_KIN_RELATIONSHIP,
  FILTER_STUDENT_REMARKS,
  FILTER_INVOICES,
  GENERATE_INVOICE_PDF,
};
