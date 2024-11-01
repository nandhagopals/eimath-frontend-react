import { gql } from "@apollo/client";

const STUDENT_KIN_FRAGMENT = gql`
  fragment studentKinFragment on StudentKin {
    id
    name
    relationship @include(if: $isStudentKinRelationshipNeed)
    isPrimaryContact: isPrimary @include(if: $isStudentKinIsPrimaryContactNeed)
    isdCode @include(if: $isStudentKinIsdCodeNeed)
    mobileNumber @include(if: $isStudentKinMobileNumberNeed)
    email @include(if: $isStudentKinEmailNeed)
    address @include(if: $isStudentKinAddressNeed)
    postalCode @include(if: $isStudentKinPostalCodeNeed)
    isdCountry @include(if: $isStudentKinISDCountryNeed) {
      id
      name
      isdCode
    }
    postalCountry @include(if: $isStudentKinPostalCountryNeed) {
      id
      name
    }
  }
`;

const STUDENT_REMARKS_FRAGMENT = gql`
  fragment studentRemarksFragment on StudentRemark {
    id
    remarks
    updatedAt
  }
`;

const STUDENT_FRAGMENT = gql`
  ${STUDENT_REMARKS_FRAGMENT}
  ${STUDENT_KIN_FRAGMENT}
  fragment studentFragment on Student {
    id
    name
    status @include(if: $isStudentStatusNeed)
    studentKins @include(if: $isStudentStudentKinsNeed) {
      ...studentKinFragment
    }
    studentRemarks @include(if: $isStudentStudentRemarksNeed) {
      ...studentRemarksFragment
    }
    educationalTerm @include(if: $isStudentEducationalTermNeed) {
      id
      name
    }
    educationalLevel @include(if: $isStudentEducationalLevelNeed) {
      id
      name
    }
    masterFranchiseeInformation
      @include(if: $isStudentMasterFranchiseeInformationNeed) {
      id
      ownerName
      masterFranchiseeName
      masterFranchiseeWorkBook
        @include(if: $isStudentMasterFranchiseeInformationWorkbooksNeed) {
        id
        price
        workbookInformation {
          id
          name
        }
      }
    }
    franchiseeInformation @include(if: $isStudentFranchiseeNeed) {
      id
      ownerName
      prefix
      franchiseeName
    }
    createdByUser @include(if: $isStudentCreatedByUserNeed) {
      id
      name
    }
    createdByMF @include(if: $isStudentCreatedByMFNeed) {
      id
      masterFranchiseeName
    }
    createdByFranchisee @include(if: $isStudentCreatedByFranchiseeNeed) {
      id
      ownerName
    }
    graduatedAt @include(if: $isStudentGraduatedAtNeed)
    withdrawnAt @include(if: $isStudentWithdrawnAtNeed)
    joinedAt @include(if: $isStudentJoinedAtNeed)
    studentDiscounts @include(if: $isStudentStudentDiscountsNeed) {
      id
      discountAmount
      description
    }
    primaryKin @include(if: $isStudentPrimaryKinNeed) {
      ...studentKinFragment
    }
    hasDiscount @include(if: $isStudentHasDiscountNeed)
    educationalCategory @include(if: $isStudentEducationalCategoryNeed) {
      id
      name
    }
    nextEducationalLevel @include(if: $isStudentNextEducationalLevelNeed) {
      id
      name
    }
    nextEducationalTerm @include(if: $isStudentNextEducationalTermNeed) {
      id
      name
      workbookInformation
        @include(if: $isStudentNextEducationalTermWorkbooksNeed) {
        id
        name
      }
    }
    withdrawRemarks @include(if: $isStudentWithdrawRemarkNeed)
  }
`;

const INVOICE_FRAGMENT = gql`
  fragment invoiceFragment on Invoice {
    id
    student @include(if: $isInvoiceStudentNeed) {
      id
      studentId
      name
      primaryKin {
        id
        name
      }
      nextEducationalTerm {
        id
        name
      }
      masterFranchiseeInformation {
        id
      }
    }
    orderingPartyStudent @include(if: $isInvoiceOrderingPartyStudentNeed) {
      id
      name
    }
    orderingPartyFranchisee
      @include(if: $isInvoiceOrderingPartyFranchiseeNeed) {
      id
      franchiseeName
    }
    orderingPartyMF @include(if: $isInvoiceOrderingPartyMFNeed) {
      id
      masterFranchiseeName
    }
    orderingPartyName @include(if: $isInvoiceOrderingPartyNameNeed)
    orderingPartyEmail @include(if: $isInvoiceOrderingPartyEmailNeed)
    total @include(if: $isInvoiceTotalNeed)
    remarks @include(if: $isInvoiceRemarksNeed)
    invoiceDiscounts @include(if: $isInvoiceInvoiceDiscountsNeed) {
      id
      description
      discountAmount
    }
    subtotal @include(if: $isInvoiceSubtotalNeed)
    gstAmount @include(if: $isInvoiceGSTAmountNeed)
    invoiceItems @include(if: $isInvoiceInvoiceItemsNeed) {
      id
      itemName
      quantity
      price
      unitPrice
      item {
        id
        name
        points
      }
      workbookInformation {
        id
        name
        price
      }
      educationalTerm {
        id
        name
        price
      }
    }
    invoiceId @include(if: $isInvoiceInvoiceIdNeed)
    createdAt @include(if: $isInvoiceCreatedAtNeed)
    updatedAt @include(if: $isInvoiceUpdatedAtNeed)
    status @include(if: $isInvoiceStatusNeed)
    discountAmount @include(if: $isInvoiceDiscountAmountNeed)
    paymentMethod @include(if: $isInvoicePaymentMethodNeed)
    category @include(if: $isInvoiceCategoryNeed)
    receiptId @include(if: $isInvoiceReceiptIdNeed)
    invoiceFileURL @include(if: $isInvoiceInvoiceFileURLNeed)
    hasDiscount @include(if: $isInvoiceHasDiscountNeed)
    type @include(if: $isInvoiceTypeNeed)
  }
`;

export { STUDENT_FRAGMENT, STUDENT_REMARKS_FRAGMENT, INVOICE_FRAGMENT };
