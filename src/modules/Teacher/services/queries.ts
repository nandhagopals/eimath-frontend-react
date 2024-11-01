import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterTeacherArgs,
  FilterTeachersResponse,
  TEACHERS_FRAGMENT,
} from "modules/Teacher";

const FILTER_TEACHERS: TypedDocumentNode<
  FilterTeachersResponse,
  FilterTeacherArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${TEACHERS_FRAGMENT}

  query FilterTeachers(
    $filter: TeacherFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isEmailNeed: Boolean = false
    $isISDCodeNeed: Boolean = false
    $isMobileNumberNeed: Boolean = false
    $isFranchiseInformationNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isMasterFranchiseeInformationNeed: Boolean = false
    $isCountryNeed: Boolean = false
    $isJoinDateNeed: Boolean = false
  ) {
    filterTeachers(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...teachersFragment
        }
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_TEACHERS };
