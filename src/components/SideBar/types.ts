import { ToOptions } from "@tanstack/react-router";

type MenuType = {
  icon: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined;
    }
  >;
  title: string;
  subTitle?: Omit<string, "subTitle">;
  aclNames: string[];
  subMenus: Omit<MenuType, "subMenus">[];
} & ToOptions;

export type { MenuType };
