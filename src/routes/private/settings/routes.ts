import { createRoute } from "@tanstack/react-router";

import {
  countryRoute,
  privateLayoutRootRoute,
  productCategoryRoute,
  generalSettingRoute,
} from "routes/private";

const settingsLayoutRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "settings",
});

const settingsRoute = settingsLayoutRoute.addChildren([
  countryRoute,
  productCategoryRoute,
  generalSettingRoute,
]);

export { settingsLayoutRoute, settingsRoute };
