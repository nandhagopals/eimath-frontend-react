import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { educationMaterialsRootRoute } from "routes";

const educationLevelRootRoute = createRoute({
  getParentRoute: () => educationMaterialsRootRoute,
  path: "levels",
});

const educationalLevelsListRoute = createRoute({
  getParentRoute: () => educationLevelRootRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("modules/EducationMaterials/Levels/Pages/Levels")
  ),
});

const educationalLevelFormRoute = createRoute({
  getParentRoute: () => educationLevelRootRoute,
  path: "$eductionLevelId",
  component: lazyRouteComponent(
    () => import("modules/EducationMaterials/Levels/Pages/LevelForm")
  ),
});

const educationalLevelRoute = educationLevelRootRoute.addChildren([
  educationalLevelsListRoute,
  educationalLevelFormRoute,
]);

export { educationalLevelRoute };
