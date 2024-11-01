import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { educationMaterialsRootRoute } from "routes";

const educationTermRootRoute = createRoute({
  getParentRoute: () => educationMaterialsRootRoute,
  path: "terms",
});

const educationalTermsListRoute = createRoute({
  getParentRoute: () => educationTermRootRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("modules/EducationMaterials/Terms/Pages/Terms")
  ),
});

const educationalTermFormRoute = createRoute({
  getParentRoute: () => educationTermRootRoute,
  path: "$eductionTermId",
  component: lazyRouteComponent(
    () => import("modules/EducationMaterials/Terms/Pages/TermForm")
  ),
});

const educationalTermRoute = educationTermRootRoute.addChildren([
  educationalTermsListRoute,
  educationalTermFormRoute,
]);

export { educationalTermRoute };
