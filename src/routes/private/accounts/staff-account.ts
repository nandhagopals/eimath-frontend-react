import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { accountRootRoute } from "routes/private";

const staffAccountRootRoute = createRoute({
  getParentRoute: () => accountRootRoute,
  path: "staff-account",
});

const staffAccountIndexRoute = createRoute({
  getParentRoute: () => staffAccountRootRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("modules/Accounts/StaffAccount/Page/StaffAccount")
  ),
});

const staffAccountCreateOrEditRoute = createRoute({
  getParentRoute: () => staffAccountRootRoute,
  path: "$staffAccountId",
  component: lazyRouteComponent(
    () => import("modules/Accounts/StaffAccount/Page/CreateOrEditStaffAccount")
  ),
});

const staffAccountRoute = staffAccountRootRoute.addChildren([
  staffAccountIndexRoute,
  staffAccountCreateOrEditRoute,
]);

export { staffAccountRoute };
