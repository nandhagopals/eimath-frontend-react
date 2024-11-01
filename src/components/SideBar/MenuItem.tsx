import { FC, Fragment, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { MenuType, NavItem } from "components/SideBar";

import ExpandIcon from "global/assets/images/expand-more-filled.svg?react";
import { combineClassName } from "global/helpers";
import { useAuth, useFindIsResourceIdsHasChecked } from "global/hook";

interface Props {
  menuItem: MenuType;
}

const MenuItem: FC<Props> = ({ menuItem }) => {
  const { authUserDetails } = useAuth();
  const { icon: Icon, title, subTitle, subMenus, aclNames } = menuItem;
  const [showSubMenu, setShowSubMenu] = useState(false);

  const subMenuToggleHandler = () => {
    setShowSubMenu(!showSubMenu);
  };

  const showMenu = useFindIsResourceIdsHasChecked(aclNames);

  return (
    <Fragment>
      {subMenus?.length > 0 ? (
        showMenu && (
          <div
            className={combineClassName(
              "w-full flex justify-start items-center px-4 gap-8 cursor-pointer hover:bg-action-hover",
              subTitle ? "py-3" : "py-2"
            )}
            onClick={subMenuToggleHandler}
          >
            <Icon className="size-6 min-w-6 min-h-6 text-action-active" />
            <div className="w-full grid grid-cols-[1fr_auto] gap-1 items-center max-w-[inherit]">
              <p className="flex flex-col truncate max-w-[inherit]">
                <span className="text-primary-text truncate">{title}</span>
                {subTitle && (
                  <span className="font-normal text-xs text-secondary-text truncate">
                    {subTitle}
                  </span>
                )}
              </p>
              <ExpandIcon
                className={combineClassName(
                  "size-8 min-w-8 max-w-10 min-h-8 max-h-10 p-1 rounded-full text-action-active hover:bg-action-hover transition-all duration-500",
                  showSubMenu ? "rotate-180" : ""
                )}
              />
            </div>
          </div>
        )
      ) : authUserDetails?.type !== "User" &&
        title === "Master Franchisee" ? null : authUserDetails?.type !==
          "MF Owner" &&
        authUserDetails?.type !== "MF Staff" &&
        subMenus?.length === 0 &&
        title === "Master Setting" ? null : (
        <NavItem isSubMenuItem={false} {...menuItem} />
      )}

      <AnimatePresence initial={false}>
        {showSubMenu && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {subMenus?.map((subMenuItem, index) => {
              return (
                <NavItem key={index} isSubMenuItem={true} {...subMenuItem} />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </Fragment>
  );
};

export default MenuItem;
