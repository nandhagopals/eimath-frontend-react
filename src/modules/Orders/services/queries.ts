import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterOrdersArgs,
  FilterOrdersResponse,
  GenerateSalesOrderPDFArgs,
  GenerateSalesOrderPDFResponse,
  GenerateDeliveryOrderPDFArgs,
  GenerateDeliveryOrderPDFResponse,
  GerOrderTypeResponse,
  GetOrderStatusResponse,
  ORDER_FRAGMENT,
  GeneratePackageListOrderPDFResponse,
  GeneratePackageListOrderArgs,
} from "modules/Orders";

const FILTER_ORDERS: TypedDocumentNode<
  FilterOrdersResponse,
  FilterOrdersArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${ORDER_FRAGMENT}
  query FilterOrders(
    $filter: OrderFilterInput
    $globalSearch: String
    $sortBy: sortBy
    $pagination: Pagination
    $isOrderOrderingPartyNameNeed: Boolean = false
    $isOrderIsOrderingPartyHQNeed: Boolean = false
    $isOrderIsOrderedToHQNeed: Boolean = false
    $isOrderIsBaseOrderNeed: Boolean = false
    $isOrderOrderIdNeed: Boolean = false
    $isOrderBaseOrderIdNeed: Boolean = false
    $isOrderStatusNeed: Boolean = false
    $isOrderTypeNeed: Boolean = false
    $isOrderRemarksNeed: Boolean = false
    $isOrderPriceNeed: Boolean = false
    $isOrderTotalPriceNeed: Boolean = false
    $isOrderGstAmountNeed: Boolean = false
    $isOrderCreatedAtNeed: Boolean = false
    $isOrderUpdatedAtNeed: Boolean = false
    $isOrderOrderItemsNeed: Boolean = false
    $isOrderOrderingPartyStudentNeed: Boolean = false
    $isOrderOrderingPartyMFNeed: Boolean = false
    $isOrderOrderingPartyFranchiseeNeed: Boolean = false
    $isOrderOrderedToMFNeed: Boolean = false
    $isOrderOrderedToFranchiseeNeed: Boolean = false
    $isOrderSalesOrderFileURLNeed: Boolean = false
    $isOrderDeliverOrderFileURLNeed: Boolean = false
    $isOrderPackingListFileURLNeed: Boolean = false
    $isOrderOrderingPartyEmailNeed: Boolean = false
  ) {
    filterOrders(
      filter: $filter
      globalSearch: $globalSearch
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...orderFragment
        }
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

const GENERATE_SALES_ORDER_PDF: TypedDocumentNode<
  GenerateSalesOrderPDFResponse,
  GenerateSalesOrderPDFArgs
> = gql`
  query GenerateSalesOrderPdf($orderId: Int!) {
    generateSalesOrderPdf(orderId: $orderId) {
      filePath
      fileName
    }
  }
`;
const GENERATE_DELIVERY_ORDER_PDF: TypedDocumentNode<
  GenerateDeliveryOrderPDFResponse,
  GenerateDeliveryOrderPDFArgs
> = gql`
  query GenerateDeliveryOrderPdf($orderId: Int!) {
    generateDeliveryOrderPdf(orderId: $orderId) {
      filePath
      fileName
    }
  }
`;

const GENERATE_PACKAGE_LIST_PDF: TypedDocumentNode<
  GeneratePackageListOrderPDFResponse,
  GeneratePackageListOrderArgs
> = gql`
  query GeneratePackingListOrderPdf($orderId: Int!) {
    generatePackingListOrderPdf(orderId: $orderId) {
      filePath
      fileName
    }
  }
`;

const GET_ORDER_TYPE: TypedDocumentNode<GerOrderTypeResponse> = gql`
  query GetOrderType {
    getOrderType
  }
`;

const GET_ORDER_STATUS: TypedDocumentNode<GetOrderStatusResponse> = gql`
  query GetOrderStatus {
    getOrderStatus
  }
`;

export {
  FILTER_ORDERS,
  GET_ORDER_TYPE,
  GENERATE_SALES_ORDER_PDF,
  GENERATE_DELIVERY_ORDER_PDF,
  GENERATE_PACKAGE_LIST_PDF,
  GET_ORDER_STATUS,
};
