import { gql } from "@apollo/client";

const PRODUCT_CATEGORY_FRAGMENT = gql`
  fragment productCategoryFragment on ProductCategory {
    id
    name
  }
`;

export { PRODUCT_CATEGORY_FRAGMENT };
