import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { settingsLayoutRoute } from "routes";

const generalSettingRoute = createRoute({
  getParentRoute: () => settingsLayoutRoute,
  path: "general-setting",
  component: lazyRouteComponent(
    () => import("modules/Settings/GeneralSetting/Pages/GeneralSetting")
  ),
});

export { generalSettingRoute };
