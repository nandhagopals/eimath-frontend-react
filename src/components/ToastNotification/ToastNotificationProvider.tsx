import { useReactiveVar } from "@apollo/client";
import { AnimatePresence } from "framer-motion";
import { type FC, Fragment, type ReactNode } from "react";

import ToastNotificationItem from "components/ToastNotification/ToastNotificationItem";

import { toastNotification } from "global/cache";
import { uuid } from "global/helpers";

interface Props {
  children: ReactNode;
}

const ToastedNotificationProvider: FC<Props> = ({ children }) => {
  const notifications = useReactiveVar(toastNotification);

  return (
    <Fragment>
      <AnimatePresence>
        {notifications
          ? notifications?.map((notification) => {
              return (
                <ToastNotificationItem
                  key={uuid()}
                  messageType={notification?.messageType}
                  message={notification?.message}
                />
              );
            })
          : null}
      </AnimatePresence>
      {children}
    </Fragment>
  );
};

export default ToastedNotificationProvider;
