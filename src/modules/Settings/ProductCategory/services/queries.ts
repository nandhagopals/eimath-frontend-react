import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterProductCategoriesArgs,
  FilterProductCategoryResponse,
  PRODUCT_CATEGORY_FRAGMENT,
} from "modules/Settings/ProductCategory";

const FILTER_PRODUCT_CATEGORIES: TypedDocumentNode<
  FilterProductCategoryResponse,
  FilterProductCategoriesArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${PRODUCT_CATEGORY_FRAGMENT}
  query FilterProductCategories(
    $sortBy: sortBy
    $pagination: Pagination
    $filter: ProductCategoryFilterInput
    $globalSearch: String
  ) {
    filterProductCategories(
      sortBy: $sortBy
      pagination: $pagination
      filter: $filter
      globalSearch: $globalSearch
    ) {
      edges {
        node {
          ...productCategoryFragment
        }
        cursor
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_PRODUCT_CATEGORIES };
