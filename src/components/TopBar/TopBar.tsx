import { FC, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { database } from "firebase-config";
import { onValue, ref } from "firebase/database";

import MenuIcon from "global/assets/images/menu-filled.svg?react";
import AccountIcon from "global/assets/images/person-filled.svg?react";
import NotificationIcon from "global/assets/images/notification-filled.svg?react";

import { useAllowedResource, useAuth } from "global/hook";

interface Props {
  hamburgerMenuClickHandler: () => void;
}

const TopBar: FC<Props> = ({ hamburgerMenuClickHandler }) => {
  const navigation = useNavigate();

  const profileIconHandler = () => {
    navigation({
      to: "/profile",
    });
  };
  const { authUserDetails } = useAuth();

  const canSeeProfile = useAllowedResource("Profile");

  const [notificationCount, setNotificationCount] = useState<number>(0);

  const starCountRef = ref(
    database,
    `${import.meta.env.VITE_NOTIFICATION_DB}/${authUserDetails?.id?.toString()}`
  );

  useEffect(() => {
    if (starCountRef) {
      onValue(
        starCountRef,
        (snapshot) => {
          setNotificationCount(snapshot.val()?.unRead);
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }, []);

  return (
    <header className="w-full bg-gradient-to-r from-linear-primary to-linear-secondary flex justify-between items-center py-4 px-8">
      <MenuIcon
        className="size-8 mx-2 cursor-pointer rounded-full hover:bg-action-hover p-1 text-background-default"
        onClick={hamburgerMenuClickHandler}
      />

      <span className="flex justify-items-end gap-x-2">
        <span className="flex relative">
          <NotificationIcon
            className="h-6 w-6 my-1 text-background-default cursor-pointer"
            onClick={() => {
              navigation({
                to: "/notifications",
              });
            }}
          />
          {notificationCount > 0 && (
            <span className="absolute text-[10px] text-white bg-secondary-dark rounded-full min-w-[14px] h-3.5 -top-0.5  left-[50%] inline-flex justify-center items-center p-0.5">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </span>
        {canSeeProfile && (
          <AccountIcon
            className="mr-3 w-8 h-8 p-1 bg-[#BDBDBD] rounded-full text-background-default cursor-pointer"
            onClick={profileIconHandler}
          />
        )}
      </span>
    </header>
  );
};

export default TopBar;
