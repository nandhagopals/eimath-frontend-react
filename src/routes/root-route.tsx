import { Fragment } from "react";
import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";

import { RouteContext } from "global/types";

const rootRoute = createRootRouteWithContext<RouteContext>()({
  component: () => (
    <Fragment>
      <ScrollRestoration />
      <Outlet />
    </Fragment>
  ),
  notFoundComponent: () => {
    return <div>404 Page</div>;
  },
});

export default rootRoute;
