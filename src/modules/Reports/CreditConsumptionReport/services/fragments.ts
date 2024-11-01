import { gql } from "@apollo/client";

// const CREDIT_CONSUMPTION_REPORT_FRAGMENT = gql`
//   fragment creditConsumptionReportFragment on CreditConsumptionReport {
//     id
//     books @include(if: $isCreditConsumptionReportBooksNeed)
//     bgk @include(if: $isCreditConsumptionReportBgkNeed)
//     pgl @include(if: $isCreditConsumptionReportPglNeed)
//     sgk @include(if: $isCreditConsumptionReportSgkNeed)
//     total @include(if: $isCreditConsumptionReportTotalNeed)
//   }
// `;

const CREDIT_CONSUMPTION_REPORT_FRAGMENT = gql`
  fragment creditConsumptionReportFragment on ForecastReport {
    educationalTerm @include(if: $isEducationalTermNeed)
    franchiseeWiseStudentCount @include(if: $isFranchiseeWiseStudentCountNeed) {
      franchisee
      studentCount
    }
    totalStudentCount @include(if: $isTotalStudentCountNeed)
  }
`;

export { CREDIT_CONSUMPTION_REPORT_FRAGMENT };
