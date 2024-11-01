import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";

import { publicLayoutRootRoute } from "routes";

const loginRoute = createRoute({
  getParentRoute: () => publicLayoutRootRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("modules/Authentication/Pages/Login/Login")
  ),
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => publicLayoutRootRoute,
  path: "/forgot-password",
  component: lazyRouteComponent(
    () => import("modules/Authentication/Pages/UpdatePassword/ForgotPassword")
  ),
});

const updatePasswordRoute = createRoute({
  getParentRoute: () => publicLayoutRootRoute,
  path: "/reset-password",
  component: lazyRouteComponent(
    () => import("modules/Authentication/Pages/UpdatePassword/UpdatePassword")
  ),
  validateSearch: z.object({
    auth: z.string().nullish(),
  }),
});

const createPasswordRoute = createRoute({
  getParentRoute: () => publicLayoutRootRoute,
  path: "/create-password",
  component: lazyRouteComponent(
    () => import("modules/Authentication/Pages/UpdatePassword/UpdatePassword")
  ),
  validateSearch: z.object({
    auth: z.string().nullish(),
  }),
});

export {
  loginRoute,
  forgotPasswordRoute,
  updatePasswordRoute,
  createPasswordRoute,
};
