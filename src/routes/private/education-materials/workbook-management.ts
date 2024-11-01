import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { educationMaterialsRootRoute } from "routes";

const workbookManagementRootRoute = createRoute({
  getParentRoute: () => educationMaterialsRootRoute,
  path: "workbook-management",
});

const workbookManagementListRoute = createRoute({
  getParentRoute: () => workbookManagementRootRoute,
  path: "/",
  component: lazyRouteComponent(
    () =>
      import(
        "modules/EducationMaterials/WorkbookManagement/Pages/WorkbookManagement"
      )
  ),
});

const workbookManagementFormRoute = createRoute({
  getParentRoute: () => workbookManagementRootRoute,
  path: "$workbookId",
  component: lazyRouteComponent(
    () =>
      import(
        "modules/EducationMaterials/WorkbookManagement/Pages/WorkbookManagementForm"
      )
  ),
});

const workbookManagementRoute = workbookManagementRootRoute.addChildren([
  workbookManagementListRoute,
  workbookManagementFormRoute,
]);

export { workbookManagementRoute };
