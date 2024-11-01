import { gql } from "@apollo/client";

const ORDER_FRAGMENT = gql`
  fragment orderFragment on Order {
    id
    orderingPartyName @include(if: $isOrderOrderingPartyNameNeed)
    isOrderingPartyHQ @include(if: $isOrderIsOrderingPartyHQNeed)
    isOrderedToHQ @include(if: $isOrderIsOrderedToHQNeed)
    isBaseOrder @include(if: $isOrderIsBaseOrderNeed)
    orderId @include(if: $isOrderOrderIdNeed)
    baseOrderId @include(if: $isOrderBaseOrderIdNeed)
    status @include(if: $isOrderStatusNeed)
    type @include(if: $isOrderTypeNeed)
    remarks @include(if: $isOrderRemarksNeed)
    price @include(if: $isOrderPriceNeed)
    totalPrice @include(if: $isOrderTotalPriceNeed)
    gstAmount @include(if: $isOrderGstAmountNeed)
    createdAt @include(if: $isOrderCreatedAtNeed)
    updatedAt @include(if: $isOrderUpdatedAtNeed)
    orderItems @include(if: $isOrderOrderItemsNeed) {
      id
      item {
        id
        name
      }
      itemName
      price
      quantity
      recipientName
      unitPrice
      student {
        id
        name
      }
      workbookInformation {
        id
        name
        price
      }
      educationalTerm {
        id
        name
        price
      }
    }
    orderingPartyStudent @include(if: $isOrderOrderingPartyStudentNeed) {
      id
      name
    }

    orderingPartyMF @include(if: $isOrderOrderingPartyMFNeed) {
      id
      masterFranchiseeName
      pointsAvailable
      pricePerSGD
    }
    orderingPartyFranchisee @include(if: $isOrderOrderingPartyFranchiseeNeed) {
      id
      franchiseeName
    }
    orderedToMF @include(if: $isOrderOrderedToMFNeed) {
      id
      masterFranchiseeName
      pointsAvailable
      pricePerSGD
    }
    orderedToFranchisee @include(if: $isOrderOrderedToFranchiseeNeed) {
      id
      franchiseeName
    }
    salesOrderFileURL @include(if: $isOrderSalesOrderFileURLNeed)
    deliverOrderFileURL @include(if: $isOrderDeliverOrderFileURLNeed)
    packingListFileURL @include(if: $isOrderPackingListFileURLNeed)
    orderingPartyEmail @include(if: $isOrderOrderingPartyEmailNeed)
  }
`;

export { ORDER_FRAGMENT };
