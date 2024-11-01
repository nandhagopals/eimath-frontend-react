import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";

import { ActionIconProps, ActionItem } from "components/Table";

import KebabDefaultIcon from "global/assets/images/kebab.svg?react";
import PencilIcon from "global/assets/images/pencil-filled.svg?react";
import { combineClassName } from "global/helpers";
import { Fragment } from "react/jsx-runtime";
import { Loading } from "components/Loading";

const TableAction = <T extends ActionItem>({
  type,
  Icon = type === "kebab" ? KebabDefaultIcon : PencilIcon,
  items,
  onAction,
  placement,
  className,
}: ActionIconProps<T>) => {
  return type === "kebab" ? (
    <MenuTrigger>
      <Button
        className={({ isFocusVisible }) =>
          combineClassName(
            "text-action-active w-12 h-12 rounded-full hover:bg-action-hover grid place-items-center focus:outline-none",
            isFocusVisible ? "bg-action-hover" : "",
            className
          )
        }
        slot={null}
      >
        <Icon />
      </Button>
      <Popover
        placement={placement || "bottom start"}
        offset={5}
        className={({ isEntering, isExiting }) =>
          combineClassName(
            isEntering ? "transition ease-out duration-100 opacity-0" : "",
            isExiting ? "" : ""
          )
        }
      >
        <Menu
          onAction={(key) => {
            const item =
              items?.filter((item) => item?.id === key) &&
              items?.filter((item) => item?.id === key)?.length > 0 &&
              items?.filter((item) => item?.id === key)[0]
                ? items?.filter((item) => item?.id === key)[0]
                : null;
            onAction(item);
          }}
          items={items}
          className="bg-primary-contrast shadow-elevation rounded focus:outline-none py-2 font-roboto"
        >
          {({ id, icon: menuIcon, className, loading }) => {
            const MenuIcon = menuIcon;

            return id ? (
              <MenuItem
                id={id}
                className={({ isHovered }) =>
                  combineClassName(
                    "text-primary-text px-4 py-1.5 outline-none cursor-pointer text-base font-normal flex gap-2 items-center",
                    isHovered ? "bg-action-hover" : "",
                    className
                  )
                }
              >
                {loading ? (
                  <Loading smallLoading />
                ) : (
                  <Fragment>
                    {MenuIcon ? <MenuIcon /> : null}
                    {id}
                  </Fragment>
                )}
              </MenuItem>
            ) : null;
          }}
        </Menu>
      </Popover>
    </MenuTrigger>
  ) : type === "pencil" ? (
    <Button
      className={({ isFocusVisible }) =>
        combineClassName(
          "text-action-active w-12 h-12 rounded-full hover:bg-action-hover grid place-items-center focus:outline-none",
          isFocusVisible ? "ring ring-primary-main" : "",
          className
        )
      }
      onPress={onAction}
    >
      <Icon />
    </Button>
  ) : null;
};

export { TableAction };
