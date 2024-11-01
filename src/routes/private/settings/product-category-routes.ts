import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { settingsLayoutRoute } from "routes";

const productCategoryRootRoute = createRoute({
  getParentRoute: () => settingsLayoutRoute,
  path: "product-categories",
});

const productCategoriesListRoute = createRoute({
  getParentRoute: () => productCategoryRootRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("modules/Settings/ProductCategory/Pages/ProductCategories")
  ),
});

const productCategoryFormRoute = createRoute({
  getParentRoute: () => productCategoryRootRoute,
  path: "$productCategoryId",
  component: lazyRouteComponent(
    () =>
      import("modules/Settings/ProductCategory/Pages/AddOrEditProductCategory")
  ),
});

const productCategoryRoute = productCategoryRootRoute.addChildren([
  productCategoriesListRoute,
  productCategoryFormRoute,
]);

export { productCategoryRoute };
