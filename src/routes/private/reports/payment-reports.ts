import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { reportsLayoutRoute } from "routes";

const paymentReportsRoute = createRoute({
  getParentRoute: () => reportsLayoutRoute,
  path: "payment-reports",
  component: lazyRouteComponent(
    () => import("modules/Reports/PaymentReport/Pages/PaymentReport")
  ),
});

export { paymentReportsRoute };
