import { TypedDocumentNode, gql } from "@apollo/client";

import {
  STUDENT_FRAGMENT,
  UpdateStudentResponse,
  UpdateStudentArgs,
  CreateStudentResponse,
  CreateStudentArgs,
  STUDENT_REMARKS_FRAGMENT,
  UpdateStudentRemarkResponse,
  UpdateStudentRemarkArgs,
  DeleteStudentRemarkResponse,
  DeleteStudentRemarkArgs,
  UpdateInvoiceResponse,
  UpdateInvoiceArgs,
  GenerateStudentCSVResponse,
  GenerateStudentCSVArgs,
  RenewStudentsResponse,
  RenewStudentsArgs,
  CreateStudentRemarkResponse,
  CreateStudentRemarkArgs,
  WithdrawStudentsResponse,
  WithdrawStudentArgs,
  INVOICE_FRAGMENT,
  ConfirmStudentRenewalInvoicesResponse,
  ConfirmStudentRenewalInvoicesArgs,
  UpdateBulkInvoicePaidResponse,
  UpdateBulkInvoicePaidArgs,
} from "modules/Students";

const CREATE_STUDENT: TypedDocumentNode<
  CreateStudentResponse,
  CreateStudentArgs
> = gql`
  ${STUDENT_FRAGMENT}
  mutation CreateStudent(
    $name: String!
    $masterFranchiseeInformationId: Int!
    $educationalLevelId: Int!
    $franchiseeId: Int!
    $educationalTermId: Int!
    $studentKins: [CreateStudentKin]!
    $hasDiscount: Boolean!
    $studentDiscounts: [CreateStudentDiscount]
    $educationalCategoryId: Int!
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
    createStudent(
      name: $name
      masterFranchiseeInformationId: $masterFranchiseeInformationId
      educationalLevelId: $educationalLevelId
      franchiseeInformationId: $franchiseeId
      educationalTermId: $educationalTermId
      studentKins: $studentKins
      hasDiscount: $hasDiscount
      studentDiscounts: $studentDiscounts
      educationalCategoryId: $educationalCategoryId
    ) {
      ...studentFragment
    }
  }
`;

const UPDATE_STUDENT: TypedDocumentNode<
  UpdateStudentResponse,
  UpdateStudentArgs
> = gql`
  ${STUDENT_FRAGMENT}
  mutation UpdateStudent(
    $id: Int!
    $name: String
    $status: String
    $masterFranchiseeInformationId: Int
    $franchiseeInformationId: Int
    $educationalTermId: Int
    $educationalLevelId: Int
    $studentKins: [UpdateStudentKin]
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
    updateStudent(
      id: $id
      name: $name
      status: $status
      masterFranchiseeInformationId: $masterFranchiseeInformationId
      franchiseeInformationId: $franchiseeInformationId
      educationalTermId: $educationalTermId
      educationalLevelId: $educationalLevelId
      studentKins: $studentKins
    ) {
      ...studentFragment
    }
  }
`;

const CREATE_STUDENT_REMARK: TypedDocumentNode<
  CreateStudentRemarkResponse,
  CreateStudentRemarkArgs
> = gql`
  ${STUDENT_REMARKS_FRAGMENT}
  mutation CreateStudentRemark($studentId: Int!, $remarks: String!) {
    createStudentRemark(studentId: $studentId, remarks: $remarks) {
      ...studentRemarksFragment
    }
  }
`;

const UPDATE_STUDENT_REMARK: TypedDocumentNode<
  UpdateStudentRemarkResponse,
  UpdateStudentRemarkArgs
> = gql`
  ${STUDENT_REMARKS_FRAGMENT}
  mutation UpdateStudentRemark($id: Int!, $remarks: String) {
    updateStudentRemark(id: $id, remarks: $remarks) {
      ...studentRemarksFragment
    }
  }
`;

const DELETE_STUDENT_REMARK: TypedDocumentNode<
  DeleteStudentRemarkResponse,
  DeleteStudentRemarkArgs
> = gql`
  mutation DeleteStudentRemark($id: Int!) {
    deleteStudentRemark(id: $id)
  }
`;

const UPDATE_INVOICE: TypedDocumentNode<
  UpdateInvoiceResponse,
  UpdateInvoiceArgs
> = gql`
  ${INVOICE_FRAGMENT}
  mutation UpdateInvoice(
    $id: Int!
    $orderingPartyEmail: String
    $status: String
    $remarks: String
    $paymentMethod: String
    $invoiceItems: [UpdateInvoiceItems]
    $hasDiscount: Boolean
    $invoiceDiscounts: [UpdateInvoiceDiscount]
    $isInvoiceStudentNeed: Boolean = false
    $isInvoiceInvoiceItemsNeed: Boolean = false
    $isInvoiceTotalNeed: Boolean = false
    $isInvoiceRemarksNeed: Boolean = false
    $isInvoiceInvoiceDiscountsNeed: Boolean = false
    $isInvoiceSubtotalNeed: Boolean = false
    $isInvoiceGSTAmountNeed: Boolean = false
    $isInvoiceOrderingPartyNameNeed: Boolean = false
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
    $isInvoiceOrderingPartyStudentNeed: Boolean = false
    $isInvoiceOrderingPartyFranchiseeNeed: Boolean = false
    $isInvoiceOrderingPartyMFNeed: Boolean = false
    $isInvoiceOrderingPartyEmailNeed: Boolean = false
  ) {
    updateInvoice(
      id: $id
      orderingPartyEmail: $orderingPartyEmail
      status: $status
      remarks: $remarks
      paymentMethod: $paymentMethod
      invoiceItems: $invoiceItems
      hasDiscount: $hasDiscount
      invoiceDiscounts: $invoiceDiscounts
    ) {
      ...invoiceFragment
    }
  }
`;

const UPDATE_BULK_INVOICE_PAID: TypedDocumentNode<
  UpdateBulkInvoicePaidResponse,
  UpdateBulkInvoicePaidArgs
> = gql`
  mutation UpdateBulkInvoicePaid(
    $invoiceIds: [Int!]!
    $paymentMethod: String!
  ) {
    bulkSetInvoicesPaid(invoiceIds: $invoiceIds, paymentMethod: $paymentMethod)
  }
`;

const GENERATE_STUDENT_CSV: TypedDocumentNode<
  GenerateStudentCSVResponse,
  GenerateStudentCSVArgs
> = gql`
  mutation GenerateStudentCSV {
    generateStudentCSV
  }
`;

const RENEW_STUDENTS: TypedDocumentNode<
  RenewStudentsResponse,
  RenewStudentsArgs
> = gql`
  ${INVOICE_FRAGMENT}
  mutation RenewStudent(
    $studentIds: [Int!]!
    $isRenewStudentInvoiceFileNeed: Boolean = false
    $isInvoiceStudentNeed: Boolean = false
    $isInvoiceInvoiceItemsNeed: Boolean = false
    $isInvoiceTotalNeed: Boolean = false
    $isInvoiceRemarksNeed: Boolean = false
    $isInvoiceInvoiceDiscountsNeed: Boolean = false
    $isInvoiceSubtotalNeed: Boolean = false
    $isInvoiceGSTAmountNeed: Boolean = false
    $isInvoiceOrderingPartyNameNeed: Boolean = false
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
    $isInvoiceOrderingPartyStudentNeed: Boolean = false
    $isInvoiceOrderingPartyFranchiseeNeed: Boolean = false
    $isInvoiceOrderingPartyMFNeed: Boolean = false
    $isInvoiceOrderingPartyEmailNeed: Boolean = false
  ) {
    renewStudents(studentIds: $studentIds) {
      invoice {
        ...invoiceFragment
      }
      invoiceFile @include(if: $isRenewStudentInvoiceFileNeed) {
        fileName
        filePath
      }
    }
  }
`;

const WITHDRAW_STUDENTS: TypedDocumentNode<
  WithdrawStudentsResponse,
  WithdrawStudentArgs
> = gql`
  mutation WithdrawStudents($withdrawInfo: [WithdrawStudentInput]!) {
    withdrawStudents(withdrawInfo: $withdrawInfo)
  }
`;

const CONFIRM_STUDENT_RENEWAL_INVOICES: TypedDocumentNode<
  ConfirmStudentRenewalInvoicesResponse,
  ConfirmStudentRenewalInvoicesArgs
> = gql`
  mutation ConfirmStudentRenewalInvoices($invoiceIds: [Int!]!) {
    confirmStudentRenewalInvoices(invoiceIds: $invoiceIds)
  }
`;

export {
  CREATE_STUDENT,
  UPDATE_STUDENT,
  UPDATE_STUDENT_REMARK,
  DELETE_STUDENT_REMARK,
  UPDATE_INVOICE,
  GENERATE_STUDENT_CSV,
  RENEW_STUDENTS,
  CREATE_STUDENT_REMARK,
  WITHDRAW_STUDENTS,
  CONFIRM_STUDENT_RENEWAL_INVOICES,
  UPDATE_BULK_INVOICE_PAID,
};
