import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { privateLayoutRootRoute } from "routes";

const teacherRootRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "teacher",
});

const teacherListRoute = createRoute({
  getParentRoute: () => teacherRootRoute,
  path: "/",
  component: lazyRouteComponent(() => import("modules/Teacher/Pages/Teacher")),
});

const teacherFormRoute = createRoute({
  getParentRoute: () => teacherRootRoute,
  path: "$teacherId",
  component: lazyRouteComponent(
    () => import("modules/Teacher/Pages/TeacherForm")
  ),
});

const teacherRoute = teacherRootRoute.addChildren([
  teacherListRoute,
  teacherFormRoute,
]);

export { teacherRoute };
