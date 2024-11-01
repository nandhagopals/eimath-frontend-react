import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { accountRootRoute } from "routes/private";

const roleAndAccessRootRoute = createRoute({
  getParentRoute: () => accountRootRoute,
  path: "role-access",
});

const roleAccessIndexRoute = createRoute({
  getParentRoute: () => roleAndAccessRootRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("modules/Accounts/RoleAccess/Page/RoleAccess")
  ),
});

const roleAccessCreateAndEditRoute = createRoute({
  getParentRoute: () => roleAndAccessRootRoute,
  path: "$roleAccessId",
  component: lazyRouteComponent(
    () =>
      import("modules/Accounts/RoleAccess/Page/RoleAccessForm/RoleAccessForm")
  ),
});

const roleAndAccessRoute = roleAndAccessRootRoute.addChildren([
  roleAccessIndexRoute,
  roleAccessCreateAndEditRoute,
]);

export { roleAndAccessRoute };
