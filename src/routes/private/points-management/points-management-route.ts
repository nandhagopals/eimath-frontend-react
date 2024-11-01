import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { privateLayoutRootRoute } from "routes";
import { z } from "zod";

const pointsManagementRootRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "points-management",
});

const pointsManagementListRoute = createRoute({
  getParentRoute: () => pointsManagementRootRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("modules/PointsManagement/Points/Pages/Points")
  ),
  validateSearch: z.object({
    navigateFrom: z.literal("order").nullish(),
  }),
});

const pointsTransactionHistoryRoute = createRoute({
  getParentRoute: () => pointsManagementRootRoute,
  path: "$masterFranchiseeId/history",
  component: lazyRouteComponent(
    () =>
      import(
        "modules/PointsManagement/TransactionHistory/Pages/TransactionHistory"
      )
  ),
});

const pointsManagementRoute = pointsManagementRootRoute.addChildren([
  pointsManagementListRoute,
  pointsTransactionHistoryRoute,
]);

export { pointsManagementRoute };
