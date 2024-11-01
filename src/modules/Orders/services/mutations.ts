import { TypedDocumentNode, gql } from "@apollo/client";

import {
  ConfirmOrdersArgs,
  ConfirmOrdersResponse,
  ConsolidateOrdersArgs,
  ConsolidateOrdersResponse,
  CreateOrderArgs,
  CreateOrderResponse,
  GenerateOrderCSVArgs,
  GenerateOrderCSVResponse,
  ORDER_FRAGMENT,
  SendDeliveryOrderMailArgs,
  SendDeliveryOrderMailResponse,
  SendPackageListMailArgs,
  SendPackageListMailResponse,
  SendSalesOrderMailArgs,
  SendSalesOrderMailResponse,
  UpdateOrderArgs,
  UpdateOrderResponse,
} from "modules/Orders";

const CREATE_ORDER: TypedDocumentNode<
  CreateOrderResponse,
  CreateOrderArgs
> = gql`
  ${ORDER_FRAGMENT}
  mutation CreateOrder(
    $orderItems: [createOrderItems]!
    $orderingPartyEmail: String
    $orderingPartyName: String
    $orderingPartyStudentId: Int
    $orderingPartyFranchiseeId: Int
    $orderingPartyMFId: Int
    $isOrderingPartyHQ: Boolean
    $orderedToFranchiseeId: Int
    $orderedToMFId: Int
    $isOrderedToHQ: Boolean
    $remarks: String
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
    createOrder(
      orderItems: $orderItems
      orderingPartyEmail: $orderingPartyEmail
      orderingPartyName: $orderingPartyName
      orderingPartyStudentId: $orderingPartyStudentId
      orderingPartyFranchiseeId: $orderingPartyFranchiseeId
      orderingPartyMFId: $orderingPartyMFId
      isOrderingPartyHQ: $isOrderingPartyHQ
      orderedToFranchiseeId: $orderedToFranchiseeId
      orderedToMFId: $orderedToMFId
      isOrderedToHQ: $isOrderedToHQ
      remarks: $remarks
    ) {
      ...orderFragment
    }
  }
`;

const UPDATE_ORDER: TypedDocumentNode<
  UpdateOrderResponse,
  UpdateOrderArgs
> = gql`
  ${ORDER_FRAGMENT}
  mutation UpdateOrder(
    $id: Int!
    $orderingPartyName: String
    $orderingPartyEmail: String
    $orderingPartyStudentId: Int
    $orderingPartyFranchiseeId: Int
    $orderingPartyMFId: Int
    $remarks: String
    $status: String
    $orderItems: [UpdateOrderItems]
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
    updateOrder(
      id: $id
      orderingPartyName: $orderingPartyName
      orderingPartyEmail: $orderingPartyEmail
      orderingPartyStudentId: $orderingPartyStudentId
      orderingPartyFranchiseeId: $orderingPartyFranchiseeId
      orderingPartyMFId: $orderingPartyMFId
      remarks: $remarks
      status: $status
      orderItems: $orderItems
    ) {
      ...orderFragment
    }
  }
`;

const GENERATE_ORDER_CSV: TypedDocumentNode<
  GenerateOrderCSVResponse,
  GenerateOrderCSVArgs
> = gql`
  mutation GenerateOrderCSV($mfScreen: String) {
    generateOrderCSV(mfScreen: $mfScreen)
  }
`;

const CONFIRM_ORDERS: TypedDocumentNode<
  ConfirmOrdersResponse,
  ConfirmOrdersArgs
> = gql`
  mutation ConfirmOrders($orderIds: [Int!]!) {
    confirmOrders(orderIds: $orderIds)
  }
`;

export const CONSOLIDATE_ORDERS: TypedDocumentNode<
  ConsolidateOrdersResponse,
  ConsolidateOrdersArgs
> = gql`
  mutation ConsolidateOrders($orderIds: [Int!]!) {
    consolidateOrders(orderIds: $orderIds)
  }
`;

const SEND_SALES_ORDER_MAIL: TypedDocumentNode<
  SendSalesOrderMailResponse,
  SendSalesOrderMailArgs
> = gql`
  mutation SendSalesOrderMail($orderId: Int!) {
    sendSalesOrderMail(orderId: $orderId)
  }
`;

const SEND_DELIVERY_ORDER_MAIL: TypedDocumentNode<
  SendDeliveryOrderMailResponse,
  SendDeliveryOrderMailArgs
> = gql`
  mutation SendDeliveryOrderMail($orderId: Int!) {
    sendDeliveryOrderMail(orderId: $orderId)
  }
`;

const SEND_PACKAGE_LIST_MAIL: TypedDocumentNode<
  SendPackageListMailResponse,
  SendPackageListMailArgs
> = gql`
  mutation SendPackingListMail($orderId: Int!) {
    sendPackingListMail(orderId: $orderId)
  }
`;
export {
  CREATE_ORDER,
  UPDATE_ORDER,
  GENERATE_ORDER_CSV,
  CONFIRM_ORDERS,
  SEND_SALES_ORDER_MAIL,
  SEND_DELIVERY_ORDER_MAIL,
  SEND_PACKAGE_LIST_MAIL,
};
