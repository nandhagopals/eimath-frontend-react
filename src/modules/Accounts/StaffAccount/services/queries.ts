import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  STAFF_FRAGMENT,
  FilterStaffArgs,
  FilterStaffsResponse,
} from "modules/Accounts/StaffAccount";

const FILTER_STAFFS: TypedDocumentNode<
  FilterStaffsResponse,
  FilterStaffArgs
> = gql`
  ${STAFF_FRAGMENT}
  ${PAGINATION_INFO_FRAGMENT}
  query FilterStaffs(
    $filter: UserFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isStaffIsdCodeNeed: Boolean = false
    $isStaffMobileNumberNeed: Boolean = false
    $isStaffEmailNeed: Boolean = false
    $isStaffDobNeed: Boolean = false
    $isStaffStatusNeed: Boolean = false
    $isStaffGenderNeed: Boolean = false
    $isStaffCountryNeed: Boolean = false
    $isStaffPasswordNeed: Boolean = false
    $isStaffRoleNeed: Boolean = false
  ) {
    filterStaffs: filterUsers(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...staffFragment
        }
        cursor
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_STAFFS };
