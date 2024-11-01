import { gql } from "@apollo/client";

const MASTER_FRANCHISEE_PRODUCT_FEE_FRAGMENT = gql`
  fragment masterFranchiseeProductFeeFragment on MasterFranchiseeProduct {
    id
    price @include(if: $isMasterFranchiseeProductFeePriceNeed)
    product @include(if: $isMasterFranchiseeProductFeeProductNeed) {
      id
      name
      productCategory {
        id
        name
      }
      productVariance {
        id
        name
      }
      description
    }
  }
`;

export { MASTER_FRANCHISEE_PRODUCT_FEE_FRAGMENT };
