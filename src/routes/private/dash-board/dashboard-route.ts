import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { privateLayoutRootRoute } from "routes";

const dashboardRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "dash-board",
  component: lazyRouteComponent(
    () => import("modules/Dashboard/Pages/Dashboard")
  ),
});

export { dashboardRoute };
