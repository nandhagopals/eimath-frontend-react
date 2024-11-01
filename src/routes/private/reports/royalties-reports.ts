import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { reportsLayoutRoute } from "routes";

const royaltiesReportsRoute = createRoute({
  getParentRoute: () => reportsLayoutRoute,
  path: "royalties-reports",
  component: lazyRouteComponent(
    () => import("modules/Reports/RoyaltiesReport/Pages/RoyaltiesReport")
  ),
});

export { royaltiesReportsRoute };
