import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { orderFormSearchSchema } from "modules/Orders";

import { privateLayoutRootRoute } from "routes";
import { z } from "zod";

const ordersRootRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "orders",
});

const ordersListRoute = createRoute({
  getParentRoute: () => ordersRootRoute,
  path: "/",
  component: lazyRouteComponent(() => import("modules/Orders/Pages/Orders")),
  validateSearch: orderFormSearchSchema,
});

const ordersFormRoute = createRoute({
  getParentRoute: () => ordersRootRoute,
  path: "$orderId",
  component: lazyRouteComponent(() => import("modules/Orders/Pages/OrderForm")),
  parseParams: (param) =>
    z
      .object({
        orderId: z.union([
          z.literal("new"),
          z.coerce.number().int().nonnegative(),
        ]),
      })
      .parse(param),
  validateSearch: orderFormSearchSchema,
});

const ordersRoute = ordersRootRoute.addChildren([
  ordersListRoute,
  ordersFormRoute,
]);

export { ordersRoute };
