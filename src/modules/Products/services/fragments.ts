import { gql } from "@apollo/client";

const PRODUCTS_FRAGMENT = gql`
  fragment productsFragment on Product {
    id
    name
    hasVariance @include(if: $isHasVarianceNeed)
    points @include(if: $isPointsNeed)
    productCategory @include(if: $isProductCategoryNeed) {
      id
      name
    }
    productImages @include(if: $isProductImageNeed) {
      id
      originalFileName
      fileURL: fileUrl
      mimeType
    }
    productVariance @include(if: $isProductVarianceNeed) {
      id
      name
    }
    status @include(if: $isStatusNeed)
    description @include(if: $isDescriptionNeed)
    isComesUnderRoyalty @include(if: $isIsComesUnderRoyaltyNeed)
  }
`;

export { PRODUCTS_FRAGMENT };
