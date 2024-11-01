import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import CloseIcon from "global/assets/images/close-filled.svg?react";
import { type ToastNotification, toastNotification } from "global/cache";
import { combineClassName } from "global/helpers";

type Props = ToastNotification;

const ToastNotificationItem: FC<Props> = ({ message, messageType }) => {
  const [width, setWidth] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [intervalID, setIntervalID] = useState<any>(null!);
  const paseTimer = useRef(true);
  const handleStartTimer = () => {
    paseTimer.current = true;
    const id = setInterval(() => {
      if (paseTimer.current) {
        setWidth((prev) => {
          if (prev < 100) {
            return prev + 0.5;
          }
          clearInterval(id);
          return prev;
        });
      }
    }, 15);
    setIntervalID(id);
  };

  const handlePauseTimer = useCallback(() => {
    clearInterval(intervalID);
    paseTimer.current = false;
  }, [intervalID]);

  const handleCloseNotification = useCallback(() => {
    handlePauseTimer();
    setTimeout(() => {
      toastNotification([]);
    }, 200);
  }, [handlePauseTimer]);

  useEffect(() => {
    if (width === 100) {
      handleCloseNotification();
    }
  }, [width, handleCloseNotification]);

  useEffect(() => {
    handleStartTimer();
  }, []);

  return (
    <motion.div
      className={
        "fixed bottom-2 z-[2000] flex justify-center items-center w-full"
      }
      initial={{
        y: "100%",
      }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{
        duration: 0.3,
        delay: 0,
      }}
    >
      <div
        onMouseEnter={handlePauseTimer}
        onMouseLeave={handleStartTimer}
        aria-label="Toast notification"
        aria-describedby={message}
        role="alertdialog"
        className={combineClassName(
          "grid items-center gap-1 outline-none shadow-elevation min-w-sm max-w-sm rounded p-4 gap-y-2 bg-white",
          messageType === "error" ? "text-error-main" : "text-success-main"
        )}
      >
        <div className="flex items-center justify-center">
          <p className="text-ironside-gray text-sm flex-1 whitespace-pre-wrap items-center">
            {message}
          </p>
          <span
            onClick={handleCloseNotification}
            className={combineClassName(
              "w-6 h-6 rounded-full flex justify-center items-center cursor-pointer",
              messageType === "error" ? "text-error-main" : "text-success-main"
            )}
          >
            <CloseIcon className="w-5 h-5" />
          </span>
        </div>
        <div
          className={`h-2.5 rounded-r-full ${
            messageType === "error" ? "bg-error-main" : "bg-success-main"
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
    </motion.div>
  );
};

export default ToastNotificationItem;
