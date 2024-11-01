import { gql } from "@apollo/client";

const STUDENT_REPORT_FRAGMENT = gql`
  fragment studentReportFragment on StudentReport {
    month
    year
    totalNewStudents
    totalDiscontinuedStudents
    totalActiveStudents
    totalGraduatedStudents
  }
`;

export { STUDENT_REPORT_FRAGMENT };
