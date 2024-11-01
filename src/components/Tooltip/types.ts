import type { Placement } from "@floating-ui/react";
import type { ElementType, ReactNode } from "react";

type Trigger = "click" | "hover" | "focus";

interface TooltipProps<TElementType extends ElementType> {
  initialOpen?: boolean;
  children: ((closeObj: { close: () => void }) => ReactNode) | ReactNode;
  render: string | number | ((data: { close: () => void }) => ReactNode);
  placement?: Placement;
  className?: string;
  arrow?: boolean;
  classForArrow?: {
    arrowVisibility?: number;
    arrowStyle?: string;
  };
  offsetNumber?: number;
  trigger?: Trigger[];
  interaction?: boolean;
  classNameForParent?: string;
  fallbackPlacements?: Placement[];
  as?: TElementType;
  onParentClick?: () => void;
}

export type { Trigger, TooltipProps };
