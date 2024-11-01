import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { reportsLayoutRoute } from "routes";

const creditConsumptionsReportsRoute = createRoute({
  getParentRoute: () => reportsLayoutRoute,
  path: "forecast-reports",
  component: lazyRouteComponent(
    () =>
      import(
        "modules/Reports/CreditConsumptionReport/Pages/CreditConsumptionReport"
      )
  ),
});

export { creditConsumptionsReportsRoute };
