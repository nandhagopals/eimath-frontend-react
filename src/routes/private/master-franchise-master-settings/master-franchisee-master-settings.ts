import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";

import { privateLayoutRootRoute } from "routes/private";

const masterFranchiseeMasterSettingRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "master-setting",
  component: lazyRouteComponent(
    () =>
      import(
        "modules/MasterFranchiseeMasterSetting/Pages/MasterFranchiseeMasterSetting"
      )
  ),
  validateSearch: z
    .object({
      page: z
        .union([
          z.literal("GENERAL"),
          z.literal("TERM FEES"),
          z.literal("WORKBOOK FEES"),
          z.literal("PRODUCT FEES"),
        ])
        .catch("GENERAL"),
    })
    .catch({
      page: "GENERAL",
    }),
});

export { masterFranchiseeMasterSettingRoute };
