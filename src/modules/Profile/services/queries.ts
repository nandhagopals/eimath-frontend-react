import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterHQProfileInformationArgs,
  FilterHQProfileInformationResponse,
  HQ_PROFILE_INFORMATION_FRAGMENT,
} from "modules/Profile";

const FILTER_HQ_PROFILE_INFORMATION: TypedDocumentNode<
  FilterHQProfileInformationResponse,
  FilterHQProfileInformationArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${HQ_PROFILE_INFORMATION_FRAGMENT}

  query FilterHQProfileInformation(
    $sortBy: sortBy
    $pagination: Pagination
    $isHQProfileInformationCompanyNameNeed: Boolean = false
    $isHQProfileInformationCompanyUENNeed: Boolean = false
    $isHQProfileInformationBankAccountNumberNeed: Boolean = false
    $isHQProfileInformationEmailNeed: Boolean = false
    $isHQProfileInformationIsdCountryNeed: Boolean = false
    $isHQProfileInformationMobileNumberNeed: Boolean = false
    $isHQProfileInformationAddressNeed: Boolean = false
    $isHQProfileInformationPostalCodeNeed: Boolean = false
    $isHQProfileInformationPostalCountryNeed: Boolean = false
  ) {
    getHQProfiles(sortBy: $sortBy, pagination: $pagination) {
      edges {
        node {
          ...hqProfileInformationFragment
        }
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_HQ_PROFILE_INFORMATION };
