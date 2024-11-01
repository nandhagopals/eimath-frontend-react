import { z } from "zod";
import {
  createRoute,
  lazyRouteComponent,
  redirect,
} from "@tanstack/react-router";

import { privateLayoutRootRoute } from "routes";

const franchiseeRootRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "franchisee",
});

const franchiseeListRoute = createRoute({
  getParentRoute: () => franchiseeRootRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("modules/Franchisee/Page/Franchisee")
  ),
});

const franchiseeInfoFormRoute = createRoute({
  getParentRoute: () => franchiseeRootRoute,
  path: "$franchiseeId",
  component: lazyRouteComponent(
    () => import("modules/Franchisee/Page/FranchiseeForm")
  ),
  parseParams: (param) =>
    z
      .object({
        franchiseeId: z.union([
          z.literal("new"),
          z.coerce.number().int().nonnegative(),
        ]),
      })
      .parse(param),
  onError: () => {
    throw redirect({
      to: "/franchisee",
    });
  },
});

const franchiseeRoute = franchiseeRootRoute.addChildren([
  franchiseeListRoute,
  franchiseeInfoFormRoute,
]);

export { franchiseeRoute };
