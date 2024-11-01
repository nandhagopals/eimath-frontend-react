import { createRoute } from "@tanstack/react-router";

import {
  privateLayoutRootRoute,
  staffAccountRoute,
  roleAndAccessRoute,
  masterFranchiseeAccessRoute,
  franchiseeAccessRoute,
} from "routes/private";

const accountRootRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "accounts",
});

const accountRoute = accountRootRoute.addChildren([
  staffAccountRoute,
  roleAndAccessRoute,
  masterFranchiseeAccessRoute,
  franchiseeAccessRoute,
]);

export { accountRootRoute, accountRoute };
