import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { educationMaterialsRootRoute } from "routes";

const educationalCategoryRootRoute = createRoute({
  getParentRoute: () => educationMaterialsRootRoute,
  path: "educational-categories",
});

const educationalCategoryListRoute = createRoute({
  getParentRoute: () => educationalCategoryRootRoute,
  path: "/",
  component: lazyRouteComponent(
    () =>
      import(
        "modules/EducationMaterials/EducationalCategory/Pages/EducationalCategory"
      )
  ),
});

const educationalCategoryFormRoute = createRoute({
  getParentRoute: () => educationalCategoryRootRoute,
  path: "$eductionCategoryId",
  component: lazyRouteComponent(
    () =>
      import(
        "modules/EducationMaterials/EducationalCategory/Pages/EducationalCategoryForm"
      )
  ),
});

const educationalCategoryRoute = educationalCategoryRootRoute.addChildren([
  educationalCategoryListRoute,
  educationalCategoryFormRoute,
]);

export { educationalCategoryRoute };
