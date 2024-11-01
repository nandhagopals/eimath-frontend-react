import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import {
  checkBeforeNavigation,
  dashboardRoute,
  profileRoute,
  rootRoute,
  settingsRoute,
  accountRoute,
  royaltiesRoute,
  ordersRoute,
  salesRoute,
  paymentVouchersRoute,
  pointsManagementRoute,
  studentsRoute,
  teacherRoute,
  masterFranchiseeRoute,
  educationMaterialsRoute,
  productsRoute,
  franchiseeRoute,
  masterFranchiseeMasterSettingRoute,
  notificationsRoute,
  reportsRoute
} from "routes";

const privateLayoutRootRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "private-layout",
  component: lazyRouteComponent(() => import("layout/PrivateLayout")),
  beforeLoad: () => checkBeforeNavigation(true),
});

const privateLayoutRoute = privateLayoutRootRoute.addChildren([
  dashboardRoute,
  profileRoute,
  accountRoute,
  settingsRoute,
  royaltiesRoute,
  ordersRoute,
  salesRoute,
  paymentVouchersRoute,
  pointsManagementRoute,
  studentsRoute,
  teacherRoute,
  masterFranchiseeRoute,
  educationMaterialsRoute,
  productsRoute,
  franchiseeRoute,
  masterFranchiseeMasterSettingRoute,
  notificationsRoute,
  reportsRoute
]);

export { privateLayoutRoute, privateLayoutRootRoute };
