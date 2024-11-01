import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { privateLayoutRootRoute } from "routes";

const productsRootRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "products",
});

const productsListRoute = createRoute({
  getParentRoute: () => productsRootRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("modules/Products/Pages/Products")
  ),
});

const productsFormRoute = createRoute({
  getParentRoute: () => productsRootRoute,
  path: "$productId",
  component: lazyRouteComponent(
    () => import("modules/Products/Pages/ProductForm")
  ),
});

const productsRoute = productsRootRoute.addChildren([
  productsListRoute,
  productsFormRoute,
]);

export { productsRoute };
