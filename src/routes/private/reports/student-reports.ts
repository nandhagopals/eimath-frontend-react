import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { reportsLayoutRoute } from "routes";

const studentReportsRoute = createRoute({
  getParentRoute: () => reportsLayoutRoute,
  path: "student-reports",
  component: lazyRouteComponent(
    () => import("modules/Reports/StudentReport/Pages/StudentReport")
  ),
});

export { studentReportsRoute };
