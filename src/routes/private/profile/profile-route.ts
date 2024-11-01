import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { privateLayoutRootRoute } from "routes";

const profileRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "profile",
  component: lazyRouteComponent(() => import("modules/Profile/Pages/Profile")),
});

export { profileRoute };
