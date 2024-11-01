import { createRoute } from "@tanstack/react-router";

import {
  privateLayoutRootRoute,
  workbookManagementRoute,
  educationalLevelRoute,
  educationalCategoryRoute,
  educationalTermRoute,
} from "routes";

const educationMaterialsRootRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "education-materials",
});

const educationMaterialsRoute = educationMaterialsRootRoute.addChildren([
  workbookManagementRoute,
  educationalTermRoute,
  educationalLevelRoute,
  educationalCategoryRoute,
]);

export { educationMaterialsRoute, educationMaterialsRootRoute };
