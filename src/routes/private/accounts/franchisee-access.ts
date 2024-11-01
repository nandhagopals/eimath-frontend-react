import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { accountRootRoute } from "routes/private/accounts";

const franchiseeAccessRoute = createRoute({
  getParentRoute: () => accountRootRoute,
  path: "franchisee-access",
  component: lazyRouteComponent(
    () => import("modules/Accounts/FranchiseePrivilege/Pages/FranchiseePrivilege")
  ),
});

export  { franchiseeAccessRoute  }