import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterProductsArgs,
  FilterProductsResponse,
  PRODUCTS_FRAGMENT,
} from "modules/Products";

const FILTER_PRODUCTS: TypedDocumentNode<
  FilterProductsResponse,
  FilterProductsArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${PRODUCTS_FRAGMENT}
  query FilterProducts(
    $filter: ProductFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isHasVarianceNeed: Boolean = false
    $isPointsNeed: Boolean = false
    $isProductCategoryNeed: Boolean = false
    $isProductImageNeed: Boolean = false
    $isProductVarianceNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isDescriptionNeed: Boolean = false
    $isIsComesUnderRoyaltyNeed: Boolean = false
  ) {
    filterProducts(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...productsFragment
        }
        cursor
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_PRODUCTS };
