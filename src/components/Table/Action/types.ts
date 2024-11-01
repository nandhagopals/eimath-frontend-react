import { FunctionComponent, SVGProps } from "react";

import { ReactAriaPlacement } from "global/types";

type ActionItem = {
  id: string | null;
  icon?: FunctionComponent<
    SVGProps<SVGSVGElement> & {
      title?: string | undefined;
    }
  >;
  className?: string;
  loading?: boolean;
};

type ActionIconProps<T extends ActionItem> =
  | {
      type: "kebab";
      Icon?: React.FunctionComponent<
        React.SVGProps<SVGSVGElement> & {
          title?: string | undefined;
        }
      >;
      items: T[];
      onAction: (item: T | null) => void;
      placement?: ReactAriaPlacement;
      className?: string;
    }
  | {
      type: "pencil";
      Icon?: React.FunctionComponent<
        React.SVGProps<SVGSVGElement> & {
          title?: string | undefined;
        }
      >;
      items?: never;
      onAction: () => void;
      placement?: never;
      className?: string;
    };

export type { ActionIconProps, ActionItem };
