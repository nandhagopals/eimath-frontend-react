import { redirect } from "@tanstack/react-router";
import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { privateLayoutRootRoute } from "routes";
import { z } from "zod";

const paymentVouchersRootRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "payment-vouchers",
});

const paymentVouchersListRoute = createRoute({
  getParentRoute: () => paymentVouchersRootRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("modules/PaymentVouchers/Pages/PaymentVouchers")
  ),
});

const paymentVouchersFormRoute = createRoute({
  getParentRoute: () => paymentVouchersRootRoute,
  path: "$paymentVoucherId",
  component: lazyRouteComponent(
    () => import("modules/PaymentVouchers/Pages/PaymentVouchersForm")
  ),
  parseParams: (param) =>
    z
      .object({
        paymentVoucherId: z.union([
          z.literal("new"),
          z.coerce.number().int().nonnegative(),
        ]),
      })
      .parse(param),
  onError: () => {
    throw redirect({
      to: "/payment-vouchers",
    });
  },
});

const paymentVouchersRoute = paymentVouchersRootRoute.addChildren([
  paymentVouchersListRoute,
  paymentVouchersFormRoute,
]);

export { paymentVouchersRoute };
