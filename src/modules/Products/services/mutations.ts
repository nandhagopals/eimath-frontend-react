import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CreateProductArgs,
  CreateProductResponse,
  DeleteProductArgs,
  DeleteProductResponse,
  GenerateProductCSVResponse,
  PRODUCTS_FRAGMENT,
  UpdateProductArgs,
  UpdateProductResponse,
} from "modules/Products";

const CREATE_PRODUCT: TypedDocumentNode<
  CreateProductResponse,
  CreateProductArgs
> = gql`
  ${PRODUCTS_FRAGMENT}
  mutation CreateProduct(
    $name: String!
    $productCategoryIds: [Int]!
    $productImage: Upload
    $points: Float!
    $description: String
    $hasVariance: Boolean
    $productVariances: [createProductVariance]
    $isHasVarianceNeed: Boolean = false
    $isPointsNeed: Boolean = false
    $isProductCategoryNeed: Boolean = false
    $isProductImageNeed: Boolean = false
    $isProductVarianceNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isDescriptionNeed: Boolean = false
    $isComesUnderRoyalty: Boolean = false
    $isIsComesUnderRoyaltyNeed: Boolean = false
  ) {
    createProduct(
      name: $name
      productCategoryIds: $productCategoryIds
      productImage: $productImage
      points: $points
      description: $description
      hasVariance: $hasVariance
      productVariances: $productVariances
      isComesUnderRoyalty: $isComesUnderRoyalty
    ) {
      ...productsFragment
    }
  }
`;

const UPDATE_PRODUCT: TypedDocumentNode<
  UpdateProductResponse,
  UpdateProductArgs
> = gql`
  ${PRODUCTS_FRAGMENT}
  mutation UpdateProduct(
    $id: Int!
    $name: String
    $productCategoryIds: [Int]
    $productImage: Upload
    $points: Float
    $description: String
    $hasVariance: Boolean
    $productVariances: [updateProductVariance]
    $status: String
    $isHasVarianceNeed: Boolean = false
    $isPointsNeed: Boolean = false
    $isProductCategoryNeed: Boolean = false
    $isProductImageNeed: Boolean = false
    $isProductVarianceNeed: Boolean = false
    $isStatusNeed: Boolean = false
    $isDescriptionNeed: Boolean = false
    $isIsComesUnderRoyaltyNeed: Boolean = false
    $isComesUnderRoyalty: Boolean = false
  ) {
    updateProduct(
      id: $id
      name: $name
      productCategoryIds: $productCategoryIds
      productImage: $productImage
      points: $points
      description: $description
      hasVariance: $hasVariance
      productVariances: $productVariances
      status: $status
      isComesUnderRoyalty: $isComesUnderRoyalty
    ) {
      ...productsFragment
    }
  }
`;

const DELETE_PRODUCT: TypedDocumentNode<
  DeleteProductResponse,
  DeleteProductArgs
> = gql`
  mutation DeleteProduct($id: Int!) {
    deleteProduct(id: $id)
  }
`;

const GENERATE_PRODUCT_CSV: TypedDocumentNode<GenerateProductCSVResponse> = gql`
  mutation GenerateProductCSV {
    generateProductCSV
  }
`;

export { CREATE_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT, GENERATE_PRODUCT_CSV };
