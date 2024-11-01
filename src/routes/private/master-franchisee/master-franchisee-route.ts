import { z } from "zod";
import {
  createRoute,
  lazyRouteComponent,
  redirect,
} from "@tanstack/react-router";

import { privateLayoutRootRoute } from "routes";

const masterFranchiseeRootRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "master-franchisee",
});

const masterFranchiseeListRoute = createRoute({
  getParentRoute: () => masterFranchiseeRootRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("modules/MasterFranchisee/Pages/MasterFranchisee")
  ),
});

const masterFranchiseeInfoFormRoute = createRoute({
  getParentRoute: () => masterFranchiseeRootRoute,
  path: "$infoId",
  component: lazyRouteComponent(
    () =>
      import(
        "modules/MasterFranchisee/Pages/MasterFranchiseeForm/MasterFranchiseeForm"
      )
  ),
  validateSearch: z
    .object({
      page: z
        .union([
          z.literal("INFORMATION"),
          z.literal("GENERAL"),
          z.literal("TERM FEES"),
          z.literal("WORKBOOK FEES"),
          z.literal("PRODUCT FEES"),
        ])
        .catch("INFORMATION"),
    })
    .catch({
      page: "INFORMATION",
    }),
  parseParams: (param) =>
    z
      .object({
        infoId: z.union([
          z.literal("new"),
          z.coerce.number().int().nonnegative(),
        ]),
      })
      .parse(param),
  onError: () => {
    throw redirect({
      to: "/master-franchisee",
    });
  },
});

const masterFranchiseeRoute = masterFranchiseeRootRoute.addChildren([
  masterFranchiseeListRoute,
  masterFranchiseeInfoFormRoute,
]);

export { masterFranchiseeRoute };
