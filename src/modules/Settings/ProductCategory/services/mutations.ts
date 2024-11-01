import { TypedDocumentNode, gql } from "@apollo/client";

import {
  CreateProductCategoryArgs,
  CreateProductCategoryResponse,
  DeleteProductCategoryArgs,
  DeleteProductCategoryResponse,
  GenerateProductCategoryCSVResponse,
  PRODUCT_CATEGORY_FRAGMENT,
  UpdateProductCategoryArgs,
  UpdateProductCategoryResponse,
} from "modules/Settings/ProductCategory";

const CREATE_PRODUCT_CATEGORY: TypedDocumentNode<
  CreateProductCategoryResponse,
  CreateProductCategoryArgs
> = gql`
  ${PRODUCT_CATEGORY_FRAGMENT}
  mutation CreateProductCategory($name: String!) {
    createProductCategory(name: $name) {
      ...productCategoryFragment
    }
  }
`;

const UPDATE_PRODUCT_CATEGORY: TypedDocumentNode<
  UpdateProductCategoryResponse,
  UpdateProductCategoryArgs
> = gql`
  ${PRODUCT_CATEGORY_FRAGMENT}
  mutation UpdateProductCategory($id: Int!, $name: String) {
    updateProductCategory(id: $id, name: $name) {
      ...productCategoryFragment
    }
  }
`;

const DELETE_PRODUCT_CATEGORY: TypedDocumentNode<
  DeleteProductCategoryResponse,
  DeleteProductCategoryArgs
> = gql`
  mutation DeleteProductCategory($id: Int!) {
    deleteProductCategory(id: $id)
  }
`;

const GENERATE_PRODUCT_CATEGORY_CSV: TypedDocumentNode<GenerateProductCategoryCSVResponse> = gql`
  mutation GenerateProductCategoryCSV {
    generateProductCategoryCSV
  }
`;

export {
  CREATE_PRODUCT_CATEGORY,
  UPDATE_PRODUCT_CATEGORY,
  DELETE_PRODUCT_CATEGORY,
  GENERATE_PRODUCT_CATEGORY_CSV,
};
