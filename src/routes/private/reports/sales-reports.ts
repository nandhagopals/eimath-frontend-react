import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { reportsLayoutRoute } from "routes";

const salesReportsRoute = createRoute({
  getParentRoute: () => reportsLayoutRoute,
  path: "sales-reports",
  component: lazyRouteComponent(
    () => import("modules/Reports/SalesReport/Pages/SalesReport")
  ),
});

export { salesReportsRoute };
