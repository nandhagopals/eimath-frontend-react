import { Fragment, useEffect, useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { useLazyQuery, useReactiveVar } from "@apollo/client";

import { TopBar } from "components/TopBar";
import { SideBar } from "components/SideBar";
import FilePreviewModal from "components/FilePreviewModal/FilePreviewModal";
import { Loading } from "components/Loading";

import { useAuth, useWindowSize } from "global/hook";
import {
  allowedResourceIds,
  filePreview,
  toastNotification,
} from "global/cache/cache";
import {
  isAuthorizedUser,
  messageHelper,
  somethingWentWrongMessage,
} from "global/helpers";

import { ACL_TREE } from "modules/Accounts/RoleAccess";

const PrivateLayout = () => {
  const auth = useAuth();
  const [showSideBar, setShowSideBar] = useState<boolean>(true);
  const { width } = useWindowSize();

  useEffect(() => {
    if (
      localStorage?.token &&
      localStorage?.token?.length > 100 &&
      (isAuthorizedUser()?.id ?? -1) > 0 &&
      (!auth?.authUserDetails?.id || auth?.authUserDetails?.id < 0)
    ) {
      auth.setAuthUserDetails({
        id: isAuthorizedUser()?.id ?? -1,
        type: isAuthorizedUser()?.type ?? "None",
      });
    }
  }, [auth]);

  useEffect(() => {
    if (width < 768) {
      setShowSideBar(false);
    } else if (width > 1024) {
      setShowSideBar(true);
    }
  }, [width]);

  const hamburgerMenuClickHandler = () => {
    setShowSideBar((prevStatus) => !prevStatus);
  };

  const filePreviewValues = useReactiveVar(filePreview);

  const [fetchACL, { loading, error, data }] = useLazyQuery(ACL_TREE, {
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (
      (auth?.authUserDetails?.id && auth?.authUserDetails?.id > 0) ||
      auth?.authUserDetails?.id !== isAuthorizedUser()?.id
    ) {
      fetchACL({
        variables: {
          isMyRole: true,
          isACLTreeAllowedResourceIdsNeed: true,
        },
      })
        .then((response) => {
          if (
            response?.data?.aclTree?.allowedResourceIds &&
            response?.data?.aclTree?.allowedResourceIds?.length > 0
          ) {
            allowedResourceIds(
              response?.data?.aclTree?.allowedResourceIds || []
            );
          } else {
            allowedResourceIds([]);

            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((error) => {
          allowedResourceIds([]);

          toastNotification(messageHelper(error));
        });
    }
  }, [auth?.authUserDetails?.id, fetchACL]);

  const showAnIssue =
    (error?.message && error?.message?.length > 0) ||
    (data?.aclTree?.allowedResourceIds &&
      data?.aclTree?.allowedResourceIds?.length <= 0);

  return (
    <main className="flex flex-col min-h-dvh">
      {loading ? (
        <Loading color="secondary" className="min-h-dvh" />
      ) : (
        <Fragment>
          <TopBar hamburgerMenuClickHandler={hamburgerMenuClickHandler} />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-[auto_1fr] bg-background-default">
            <SideBar showSideBar={showSideBar} />
            <div className="px-2 md:px-[30px] py-2 md:py-[24px] min-h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-y-auto w-full transition-all duration-300">
              {showAnIssue ? (
                <p>
                  Sorry, you have an access issue. Please contact your
                  administrator.
                </p>
              ) : (
                <Outlet />
              )}
            </div>
          </div>
          {filePreviewValues?.data && !showAnIssue && (
            <FilePreviewModal
              data={filePreviewValues?.data}
              title={filePreviewValues?.title}
            />
          )}
        </Fragment>
      )}
    </main>
  );
};

export default PrivateLayout;
