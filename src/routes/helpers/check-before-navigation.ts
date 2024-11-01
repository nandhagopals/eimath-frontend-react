import { redirect } from "@tanstack/react-router";

import { isAuthorizedUser } from "global/helpers";

const checkBeforeNavigation = (isPrivateLayout: boolean) => {
  if (isPrivateLayout) {
    if (!isAuthorizedUser()?.id) {
      throw redirect({
        to: "/",
      });
    }
  } else {
    if (isAuthorizedUser()?.id) {
      throw redirect({
        to: "/dash-board",
      });
    }
  }
};

export { checkBeforeNavigation };
