import { createRoute } from "@tanstack/react-router";

import {
  checkBeforeNavigation,
  loginRoute,
  forgotPasswordRoute,
  rootRoute,
  updatePasswordRoute,
  createPasswordRoute,
} from "routes";

const publicLayoutRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public-layout",
  beforeLoad: () => checkBeforeNavigation(false),
});

const publicLayoutRoute = publicLayoutRootRoute.addChildren([
  loginRoute,
  forgotPasswordRoute,
  updatePasswordRoute,
  createPasswordRoute,
]);

export { publicLayoutRootRoute, publicLayoutRoute };
