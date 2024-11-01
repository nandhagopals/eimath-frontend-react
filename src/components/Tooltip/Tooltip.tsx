import { FC, ReactNode } from "react";
import {
  Button,
  ButtonProps,
  OverlayArrow,
  OverlayArrowProps,
  TooltipProps,
  TooltipTrigger,
  TooltipTriggerComponentProps,
  Tooltip as _Tooltip,
} from "react-aria-components";

import { combineClassName } from "global/helpers";

interface Props {
  children: ReactNode;
  renderer: ReactNode;
  isArrow?: boolean;
  rootProps?: TooltipTriggerComponentProps;
  contentProps?: TooltipProps;
  arrowProps?: OverlayArrowProps;
  triggerProps?: ButtonProps;
}

const Tooltip: FC<Props> = ({
  children,
  renderer,
  isArrow = false,
  contentProps,
  rootProps,
  arrowProps,
  triggerProps,
}) => {
  return (
    <TooltipTrigger
      {...rootProps}
      delay={rootProps?.delay ?? 200}
      closeDelay={rootProps?.closeDelay ?? 300}
    >
      <Button {...triggerProps}>{children}</Button>
      <_Tooltip
        {...contentProps}
        className={({ isEntering, isExiting }) =>
          combineClassName(
            "bg-primary-light px-2 py-1 text-primary-main rounded text-[10px] font-medium",
            isEntering ? "animate-fadeIn" : "",
            isExiting ? "animate-fadeOut" : "",
            contentProps?.className
          )
        }
        placement={contentProps?.placement ?? "top"}
      >
        {isArrow && (
          <OverlayArrow {...arrowProps}>
            <svg width={8} height={8} viewBox="0 0 8 8" fill="#ffe9dc">
              <path d="M0 0 L4 4 L8 0" />
            </svg>
          </OverlayArrow>
        )}
        {renderer}
      </_Tooltip>
    </TooltipTrigger>
  );
};

export default Tooltip;
