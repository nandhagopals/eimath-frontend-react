import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { accountRootRoute } from "routes/private/accounts";

const masterFranchiseeAccessRoute = createRoute({
  getParentRoute: () => accountRootRoute,
  path: "master-franchisee-access",
  component: lazyRouteComponent(
    () => import("modules/Accounts/MasterFranchiseePrivilege/Pages/MasterFranchiseePrivilege")
  ),
});

export  { masterFranchiseeAccessRoute  }