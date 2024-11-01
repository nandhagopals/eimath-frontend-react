import { z } from "zod";

import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  DateTime,
  FilterDate,
  FilterFloat,
  FilterInteger,
  FilterString,
  Nullish,
  PDF,
} from "global/types";

import { Product } from "modules/Products";
import { orderStatusSchema, orderTypeSchema } from "modules/Orders";
import { Student } from "modules/Students";
import { WorkbookInformation } from "modules/EducationMaterials/WorkbookManagement";
import { MasterFranchiseeInformation } from "modules/MasterFranchisee";
import { Franchisee } from "modules/Franchisee";
import { EducationalTerm } from "modules/EducationMaterials/Terms";

type OrderStatus = z.infer<typeof orderStatusSchema>;

type OrderType = z.infer<typeof orderTypeSchema>;

type Order = Nullish<{
  id: number;
  orderingPartyName: string;
  isOrderingPartyHQ: boolean;
  isOrderedToHQ: boolean;
  isBaseOrder: boolean;
  orderId: string;
  baseOrderId: string;
  status: OrderStatus;
  type: OrderType;
  remarks: string;
  price: number;
  totalPrice: number;
  gstAmount: number;
  createdAt: DateTime;
  updatedAt: DateTime;
  orderItems: Nullish<{
    id: number;
    unitPrice: number;
    price: number;
    quantity: number;
    student: Student;
    recipientName: string;
    item: Product;
    itemName: string;
    workbookInformation: WorkbookInformation;
    educationalTerm: EducationalTerm;
  }>[];
  orderingPartyStudent: Student;
  orderingPartyMF: MasterFranchiseeInformation;
  orderingPartyFranchisee: Franchisee;
  orderedToMF: MasterFranchiseeInformation;
  orderedToFranchisee: Franchisee;
  salesOrderFileURL: string;
  deliverOrderFileURL: string;
  packingListFileURL: string;
  orderingPartyEmail: string;
}>;

type OrderFieldArgs = Nullish<{
  isOrderOrderingPartyNameNeed: boolean;
  isOrderIsOrderingPartyHQNeed: boolean;
  isOrderIsOrderedToHQNeed: boolean;
  isOrderIsBaseOrderNeed: boolean;
  isOrderOrderIdNeed: boolean;
  isOrderBaseOrderIdNeed: boolean;
  isOrderStatusNeed: boolean;
  isOrderTypeNeed: boolean;
  isOrderRemarksNeed: boolean;
  isOrderPriceNeed: boolean;
  isOrderTotalPriceNeed: boolean;
  isOrderGstAmountNeed: boolean;
  isOrderCreatedAtNeed: boolean;
  isOrderUpdatedAtNeed: boolean;
  isOrderOrderItemsNeed: boolean;
  isOrderOrderingPartyStudentNeed: boolean;
  isOrderOrderingPartyMFNeed: boolean;
  isOrderOrderingPartyFranchiseeNeed: boolean;
  isOrderOrderedToMFNeed: boolean;
  isOrderOrderedToFranchiseeNeed: boolean;
  isOrderSalesOrderFileURLNeed: boolean;
  isOrderDeliverOrderFileURLNeed: boolean;
  isOrderPackingListFileURLNeed: boolean;
  isOrderOrderingPartyEmailNeed: boolean;
}>;

type OrderFilterInput = Nullish<{
  date: FilterDate;
  createdAt: FilterDate;
  id: FilterInteger;
  orderId: FilterString;
  orderingPartyName: FilterString;
  points: FilterFloat;
  status: FilterString;
  type: FilterString;
  mfScreen: "HQ" | "Franchisee";
}>;

type FilterOrdersResponse = Nullish<{
  filterOrders: CursorPaginationReturnType<Order>;
}>;

type FilterOrdersArgs = CursorPaginationArgs<
  OrderFilterInput,
  "id" | "orderId" | "orderParty" | "createdAt" | "price" | "status" | "type"
> &
  OrderFieldArgs;

type GenerateSalesOrderPDFResponse = {
  generateSalesOrderPdf?: PDF | null;
};

interface GenerateSalesOrderPDFArgs {
  orderId: number;
}
type GenerateDeliveryOrderPDFResponse = {
  generateDeliveryOrderPdf?: PDF | null;
};

interface GenerateDeliveryOrderPDFArgs {
  orderId: number;
}

type GerOrderTypeResponse = Nullish<{
  getOrderType: OrderType[];
}>;

type GetOrderStatusResponse = Nullish<{
  getOrderStatus: OrderStatus[];
}>;

type GeneratePackageListOrderPDFResponse = Nullish<{
  generatePackingListOrderPdf: PDF;
}>;

type GeneratePackageListOrderArgs = {
  orderId: number;
};

type ConfirmOrdersResponse = Nullish<{
  confirmOrders: string;
}>;

export type ConsolidateOrdersResponse = Nullish<{
  consolidateOrders: string;
}>;

interface ConfirmOrdersArgs {
  orderIds: number[];
}

export interface ConsolidateOrdersArgs {
  orderIds: number[];
}

type SendSalesOrderMailResponse = {
  sendSalesOrderMail?: string | null;
};

interface SendSalesOrderMailArgs {
  orderId: number;
}

type SendDeliveryOrderMailResponse = {
  sendDeliveryOrderMail?: string | null;
};

interface SendDeliveryOrderMailArgs {
  orderId: number;
}
type SendPackageListMailResponse = {
  sendPackingListMail?: string | null;
};

interface SendPackageListMailArgs {
  orderId: number;
}
export type {
  Order,
  OrderFieldArgs,
  OrderFilterInput,
  FilterOrdersResponse,
  FilterOrdersArgs,
  GenerateSalesOrderPDFArgs,
  GenerateSalesOrderPDFResponse,
  GenerateDeliveryOrderPDFArgs,
  GenerateDeliveryOrderPDFResponse,
  GerOrderTypeResponse,
  GetOrderStatusResponse,
  OrderStatus,
  ConfirmOrdersArgs,
  ConfirmOrdersResponse,
  SendDeliveryOrderMailArgs,
  SendDeliveryOrderMailResponse,
  SendPackageListMailArgs,
  SendPackageListMailResponse,
  SendSalesOrderMailArgs,
  SendSalesOrderMailResponse,
  GeneratePackageListOrderArgs,
  GeneratePackageListOrderPDFResponse,
};
