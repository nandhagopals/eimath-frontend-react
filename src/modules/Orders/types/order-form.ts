import { z } from "zod";

import { Nullish } from "global/types";

import {
  Order,
  OrderFieldArgs,
  OrderStatus,
  orderFormSchema,
} from "modules/Orders";

type CreateOrderResponse = Nullish<{
  createOrder: Order;
}>;

interface CreateOrderArgs extends OrderFieldArgs {
  orderItems: {
    itemId?: number | null;
    itemName?: string | null;
    quantity: number;
    recipientName?: string | null;
    studentId?: number | null;
    unitPrice: number;
    workbookInformationId?: number | null;
    educationalTermId?: number | null;
  }[];
  orderingPartyEmail?: string | null;
  orderingPartyName?: string | null;
  orderingPartyStudentId?: number | null;
  orderingPartyFranchiseeId?: number | null;
  orderingPartyMFId?: number | null;
  isOrderingPartyHQ?: boolean | null;
  orderedToFranchiseeId?: number | null;
  orderedToMFId?: number | null;
  isOrderedToHQ?: boolean | null;
  remarks?: string | null;
}

type UpdateOrderResponse = Nullish<{
  updateOrder: Order;
}>;

interface UpdateOrderArgs {
  id: number;
  orderingPartyName?: string | null;
  orderingPartyEmail?: string | null;
  orderingPartyStudentId?: number | null;
  orderingPartyFranchiseeId?: number | null;
  orderingPartyMFId?: number | null;
  remarks?: string | null;
  status?: OrderStatus;
  orderItems?: {
    id?: number | null;
    itemId?: number | null;
    itemName?: string | null;
    quantity: number;
    recipientName?: string | null;
    studentId?: number | null;
    unitPrice: number;
    workbookInformationId?: number | null;
    educationalTermId?: number | null;
  }[];
}

type OrderForm = z.infer<typeof orderFormSchema>;

type GenerateOrderCSVResponse = Nullish<{
  generateOrderCSV: string;
}>;

interface GenerateOrderCSVArgs {
  mfScreen?: "HQ" | "Franchisee";
}

export type {
  CreateOrderResponse,
  CreateOrderArgs,
  UpdateOrderResponse,
  UpdateOrderArgs,
  OrderForm,
  GenerateOrderCSVResponse,
  GenerateOrderCSVArgs,
};
