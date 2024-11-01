import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { privateLayoutRootRoute } from "routes";
import { z } from "zod";

const royaltiesRootRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "royalties",
});

const royaltiesListRoute = createRoute({
  getParentRoute: () => royaltiesRootRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("modules/Royalties/Pages/Royalties")
  ),
});

const royaltyViewRoute = createRoute({
  getParentRoute: () => royaltiesRootRoute,
  path: "$royaltyId",
  component: lazyRouteComponent(
    () => import("modules/Royalties/Pages/ViewRoyalty")
  ),
  parseParams: (param) =>
    z
      .object({
        royaltyId: z.coerce.number().int().nonnegative(),
      })
      .parse(param),
  validateSearch: z.object({
    mfPrefix: z.string().nullish(),
    mfName: z.string().nullish(),
    franchiseePrefix: z.string().nullish(),
    franchiseeName: z.string().nullish(),
  }),
});

const royaltyByMFRoute = createRoute({
  getParentRoute: () => royaltiesRootRoute,
  path: "master-franchisee/$masterFranchiseeId",
  component: lazyRouteComponent(
    () => import("modules/Royalties/Pages/ViewRoyalty")
  ),
  parseParams: (param) =>
    z
      .object({
        masterFranchiseeId: z.coerce.number().int().nonnegative(),
      })
      .parse(param),
  validateSearch: z.object({
    mfPrefix: z.string().nullish(),
    mfName: z.string().nullish(),
    franchiseePrefix: z.string().nullish(),
    franchiseeName: z.string().nullish(),
  }),
});

const royaltiesRoute = royaltiesRootRoute.addChildren([
  royaltiesListRoute,
  royaltyViewRoute,
  royaltyByMFRoute,
]);

export { royaltiesRoute };
