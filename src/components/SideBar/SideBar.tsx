import { FC } from "react";
import { useNavigate } from "@tanstack/react-router";

import { MenuItem, menuList } from "components/SideBar";

import Logo from "global/assets/images/logo-50.svg?react";
import LogoutIcon from "global/assets/images/logout-filled.svg?react";
import { combineClassName } from "global/helpers";
import { client } from "global/config";

interface Props {
  showSideBar: boolean;
}

const SideBar: FC<Props> = ({ showSideBar }) => {
  const navigation = useNavigate();

  const logoutHandler = () => {
    localStorage.clear();

    client.clearStore();

    navigation({
      to: "/",
      replace: false,
    });
  };

  return (
    <div
      className={combineClassName(
        "overflow-hidden transition-all duration-500 border border-r divide-y fixed md:static bg-white z-[1]",
        showSideBar ? "w-[256px]" : "w-0"
      )}
    >
      <Logo className="mx-6 my-4" />

      <nav className="overflow-y-auto min-h-[calc(100vh-200px)] max-h-[calc(100vh-200px)] overflow-x-hidden max-w-[inherit]">
        {menuList?.map((menuItem, index) => {
          return <MenuItem key={index} menuItem={menuItem} />;
        })}
      </nav>

      <p
        className="flex flex-row gap-8 px-4 py-3 cursor-pointer hover:bg-action-hover"
        onClick={logoutHandler}
      >
        <span>
          <LogoutIcon className="text-action-active" />
        </span>
        <span className="font-normal text-base">Logout</span>
      </p>
    </div>
  );
};

export default SideBar;
