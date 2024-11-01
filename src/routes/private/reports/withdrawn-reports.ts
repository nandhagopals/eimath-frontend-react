import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { reportsLayoutRoute } from "routes";

const withdrawnReportsRoute = createRoute({
  getParentRoute: () => reportsLayoutRoute,
  path: "withdrawn-reports",
  component: lazyRouteComponent(
    () => import("modules/Reports/WithdrawnReport/Pages/WithdrawnReport")
  ),
});

export { withdrawnReportsRoute };
