/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react";
import { Link } from "@tanstack/react-router";

import { MenuType } from "components/SideBar";

import { combineClassName } from "global/helpers";
import { useFindIsResourceIdsHasChecked } from "global/hook";

type Props = {
  isSubMenuItem: boolean;
} & Omit<MenuType, "subMenus">;

const NavItem: FC<Props> = ({
  isSubMenuItem,
  icon: Icon,
  title,
  to,
  from,
  hash,
  mask,
  state,
  search,
  params,
  aclNames,
}) => {
  const showMenuItem = useFindIsResourceIdsHasChecked(aclNames);

  return (
    showMenuItem && (
      <Link
        to={to as unknown as any}
        from={from}
        hash={hash}
        mask={mask}
        state={state}
        search={search}
        params={params as unknown as any}
        preload={"intent"}
        activeProps={{ className: "bg-primary-shade" }}
        className={`w-full grid grid-cols-[auto_1fr] justify-start items-center py-3 gap-8 cursor-pointer bg-inherit hover:bg-action-hover truncate max-w-[inherit] ${
          isSubMenuItem ? "pl-8 pr-4" : "px-4"
        }`}
      >
        <Icon className="size-6 min-w-6 min-h-6 text-action-active" />
        <p
          className={combineClassName(
            "w-full max-w-[inherit] text-base font-normal",
            isSubMenuItem ? "whitespace-normal" : "truncate"
          )}
        >
          {title}
        </p>
      </Link>
    )
  );
};

export default NavItem;
