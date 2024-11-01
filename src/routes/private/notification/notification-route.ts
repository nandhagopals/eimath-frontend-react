import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { privateLayoutRootRoute } from "routes";

import { notificationFilterSchema } from "modules/Notification";

const notificationsRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "notifications",
  component: lazyRouteComponent(
    () => import("modules/Notification/Pages/Notification")
  ),
  validateSearch: notificationFilterSchema,
});

export { notificationsRoute };
