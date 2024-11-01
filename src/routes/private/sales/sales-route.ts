import { z } from "zod";
import {
  createRoute,
  lazyRouteComponent,
  redirect,
} from "@tanstack/react-router";

import { salesFilterSchema } from "modules/Sales";

import { privateLayoutRootRoute } from "routes";

const salesRootRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "sales",
});

const salesListRoute = createRoute({
  getParentRoute: () => salesRootRoute,
  path: "/",
  component: lazyRouteComponent(() => import("modules/Sales/Pages/Sales")),
  validateSearch: salesFilterSchema,
});

const saleFormRoute = createRoute({
  getParentRoute: () => salesRootRoute,
  path: "$saleId",
  parseParams: (param) =>
    z
      .object({
        saleId: z.union([
          z.literal("new"),
          z.coerce.number().int().nonnegative(),
        ]),
      })
      .parse(param),
  onError: () => {
    throw redirect({
      to: "/sales",
      search: (prev) => {
        return {
          ...prev,
          pageStatus: "INVOICE/RECEIPT",
        } as unknown as any;
      },
    });
  },
  validateSearch: salesFilterSchema,
  component: lazyRouteComponent(() => import("modules/Sales/Pages/SaleForm")),
});

const saleInvoiceRoute = createRoute({
  getParentRoute: () => salesRootRoute,
  path: "$saleId/invoice",
  parseParams: (param) =>
    z
      .object({
        saleId: z.coerce.number().int().nonnegative(),
      })
      .parse(param),
  onError: () => {
    throw redirect({
      to: "/sales",
      search: (prev) => {
        return {
          ...prev,
          pageStatus: "INVOICE/RECEIPT",
        } as unknown as any;
      },
    });
  },
  validateSearch: salesFilterSchema,
  component: lazyRouteComponent(
    () => import("modules/Sales/Pages/SalesInvoice")
  ),
});

const salesRoute = salesRootRoute.addChildren([
  salesListRoute,
  saleFormRoute,
  saleInvoiceRoute,
]);

export { salesRoute };
