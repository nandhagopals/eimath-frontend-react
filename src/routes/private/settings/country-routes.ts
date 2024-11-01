import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { settingsLayoutRoute } from "routes";

const countryRootRoute = createRoute({
  getParentRoute: () => settingsLayoutRoute,
  path: "countries",
});

const countriesIndexRoute = createRoute({
  getParentRoute: () => countryRootRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("modules/Settings/Country/Pages/Country")
  ),
});

const countryAddOrEditRoute = createRoute({
  getParentRoute: () => countryRootRoute,
  path: "$countryId",
  component: lazyRouteComponent(
    () => import("modules/Settings/Country/Pages/AddOrEditCountry")
  ),
});

const countryRoute = countryRootRoute.addChildren([
  countriesIndexRoute,
  countryAddOrEditRoute,
]);

export { countryRoute };
