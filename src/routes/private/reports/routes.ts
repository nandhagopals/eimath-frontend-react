import { createRoute } from "@tanstack/react-router";

import {
  privateLayoutRootRoute,
  salesReportsRoute,
  studentReportsRoute,
  paymentReportsRoute,
  royaltiesReportsRoute,
  withdrawnReportsRoute,
  creditConsumptionsReportsRoute,
} from "routes/private";

const reportsLayoutRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "reports",
});

const reportsRoute = reportsLayoutRoute.addChildren([
  salesReportsRoute,
  paymentReportsRoute,
  studentReportsRoute,
  royaltiesReportsRoute,
  withdrawnReportsRoute,
  creditConsumptionsReportsRoute,
]);

export { reportsLayoutRoute, reportsRoute };
