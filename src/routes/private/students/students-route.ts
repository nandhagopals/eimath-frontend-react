import { z } from "zod";
import {
  createRoute,
  lazyRouteComponent,
  redirect,
} from "@tanstack/react-router";

import { studentsFilterSchema } from "modules/Students";

import { privateLayoutRootRoute } from "routes";

const studentsRootRoute = createRoute({
  getParentRoute: () => privateLayoutRootRoute,
  path: "students",
});

const studentsListRoute = createRoute({
  getParentRoute: () => studentsRootRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("modules/Students/Pages/Students")
  ),
  validateSearch: studentsFilterSchema,
});

const studentFormRootRoute = createRoute({
  getParentRoute: () => studentsRootRoute,
  path: "$studentId",
  parseParams: (param) =>
    z
      .object({
        studentId: z.union([
          z.literal("new"),
          z.coerce.number().int().nonnegative(),
        ]),
      })
      .parse(param),
  onError: () => {
    throw redirect({
      to: "/students",
      search: true,
    });
  },
  validateSearch: studentsFilterSchema,
});

const studentFormIndexRoute = createRoute({
  getParentRoute: () => studentFormRootRoute,
  path: "/",
  component: lazyRouteComponent(
    () => import("modules/Students/Pages/StudentsForm")
  ),
  validateSearch: studentsFilterSchema,
});

// const studentFormInvoiceRoute = createRoute({
//   getParentRoute: () => studentFormRootRoute,
//   path: "invoice",
//   component: lazyRouteComponent(
//     () => import("modules/Students/Pages/StudentInvoice")
//   ),
//   validateSearch: studentsFilterSchema,
//   parseParams: (param) =>
//     z
//       .object({
//         studentId: z.coerce.number().int().nonnegative(),
//       })
//       .parse(param),
//   onError: () => {
//     throw redirect({
//       to: "/students/",
//       search: true,
//     });
//   },
// });

const studentFormRenewalRoute = createRoute({
  getParentRoute: () => studentFormRootRoute,
  path: "renewal/$renewalId",
  component: lazyRouteComponent(
    () => import("modules/Students/Pages/StudentRenewalForm")
  ),
  validateSearch: studentsFilterSchema,
  parseParams: (param) =>
    z
      .object({
        studentId: z.coerce.number().int().nonnegative(),
        renewalId: z.union([
          z.literal("new"),
          z.literal("renew-student"),
          z.coerce.number().int().nonnegative(),
        ]),
      })
      .parse(param),
  onError: () => {
    throw redirect({
      to: "/students",
      search: true,
    });
  },
});

const studentsRoute = studentsRootRoute.addChildren([
  studentsListRoute,
  studentFormRootRoute.addChildren([
    studentFormIndexRoute,
    // studentFormInvoiceRoute,
    studentFormRenewalRoute,
  ]),
]);

export { studentsRoute };
