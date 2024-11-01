import { Fragment, useState } from "react";
import { Tab } from "@headlessui/react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useReactiveVar } from "@apollo/client";

import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";

import { combineClassName } from "global/helpers";
import { useAllowedResource, useAuth, useRouteSearch } from "global/hook";
import { allowedResourceIds } from "global/cache/cache";

import { tabs, Page } from "modules/MasterFranchiseeMasterSetting";
import { TabItem } from "modules/MasterFranchisee/components";
import {
  General,
  TermFees,
  WorkBookFees,
  ProductFees,
} from "modules/MasterFranchiseeMasterSetting/Pages";
import { FILTER_MASTER_FRANCHISEE_INFORMATION } from "modules/MasterFranchisee/services";
import { MasterFranchiseeInformation } from "modules/MasterFranchisee/types";

const MasterFranchiseeMasterSetting = () => {
  const { authUserDetails } = useAuth();
  const masterFranchiseId =
    authUserDetails?.type === "MF Owner" || authUserDetails?.type === "MF Staff"
      ? authUserDetails?.id
      : null;
  const allowedResources = useReactiveVar(allowedResourceIds);
  const canViewGeneralScreen = useAllowedResource("MasterFranchiseeGeneral");
  const canViewEducationalTermScreen = useAllowedResource(
    "MasterFranchiseeEducationalTerm"
  );
  const canViewWorkbookScreen = useAllowedResource("MasterFranchiseeWorkBook");
  const canViewProductScreen = useAllowedResource("MasterFranchiseeProduct");

  const navigate = useNavigate();

  const { page } = useRouteSearch({
    from: "/private-layout/master-setting",
  });

  const updatedTabList = tabs
    ?.filter((tab) => {
      if (allowedResources?.find((value) => value === tab?.aclName)) {
        return tab;
      } else return null;
    })
    ?.filter((value) => value);

  const updatedTabPanelsList = () => {
    const tabPanelsList: React.FC<{
      navigateMasterFranchiseeTabHandler: (page: Page) => void;
      masterFranchiseeInformation:
        | MasterFranchiseeInformation
        | null
        | undefined;
    }>[] = [];

    if (canViewGeneralScreen) tabPanelsList.push(General);
    if (canViewEducationalTermScreen) tabPanelsList.push(TermFees);
    if (canViewWorkbookScreen) tabPanelsList.push(WorkBookFees);
    if (canViewProductScreen) tabPanelsList.push(ProductFees);

    return tabPanelsList;
  };

  const [selectedTabIndex, setSelectedTabIndex] = useState(
    updatedTabList?.filter((tab) => tab?.name === page)?.[0]?.id ?? 0
  );

  const tabNavigationWithACL = (page: Page) => {
    const selectedPage =
      page === "GENERAL"
        ? canViewEducationalTermScreen
          ? "TERM FEES"
          : canViewWorkbookScreen
          ? "WORKBOOK FEES"
          : canViewProductScreen
          ? "PRODUCT FEES"
          : "GENERAL"
        : page === "TERM FEES"
        ? canViewWorkbookScreen
          ? "WORKBOOK FEES"
          : canViewProductScreen
          ? "PRODUCT FEES"
          : canViewGeneralScreen
          ? "GENERAL"
          : "TERM FEES"
        : page === "WORKBOOK FEES"
        ? canViewProductScreen
          ? "PRODUCT FEES"
          : canViewGeneralScreen
          ? "GENERAL"
          : canViewEducationalTermScreen
          ? "TERM FEES"
          : "WORKBOOK FEES"
        : page === "PRODUCT FEES"
        ? canViewGeneralScreen
          ? "GENERAL"
          : canViewEducationalTermScreen
          ? "TERM FEES"
          : canViewWorkbookScreen
          ? "WORKBOOK FEES"
          : "PRODUCT FEES"
        : "GENERAL";

    navigate({
      to: "/master-setting",
      search: {
        page: selectedPage,
      },
    });

    setSelectedTabIndex(
      updatedTabList?.findIndex((tab) => tab?.name === selectedPage)
    );
  };

  const navigateMasterFranchiseeTabHandler = (page: Page) => {
    const selectedTabIndex = updatedTabList?.findIndex(
      (tab) => tab?.name === page
    );

    switch (page) {
      case "GENERAL": {
        if (canViewGeneralScreen) {
          navigate({
            to: "/master-setting",
            search: {
              page,
            },
          });
          setSelectedTabIndex(selectedTabIndex);
        } else {
          tabNavigationWithACL(page);
        }
        break;
      }
      case "TERM FEES": {
        if (canViewEducationalTermScreen) {
          navigate({
            to: "/master-setting",
            search: {
              page,
            },
          });
          setSelectedTabIndex(selectedTabIndex);
        } else {
          tabNavigationWithACL(page);
        }

        break;
      }
      case "WORKBOOK FEES": {
        if (canViewWorkbookScreen) {
          navigate({
            to: "/master-setting",
            search: {
              page,
            },
          });
          setSelectedTabIndex(selectedTabIndex);
        } else {
          tabNavigationWithACL(page);
        }

        break;
      }
      case "PRODUCT FEES": {
        if (canViewProductScreen) {
          navigate({
            to: "/master-setting",
            search: {
              page,
            },
          });
          setSelectedTabIndex(selectedTabIndex);
        } else {
          tabNavigationWithACL(page);
        }

        break;
      }
      default:
        break;
    }
  };

  const { data } = useQuery(FILTER_MASTER_FRANCHISEE_INFORMATION, {
    fetchPolicy: "cache-and-network",
    variables: {
      filter: {
        id: {
          number: +masterFranchiseId!,
        },
      },
      isMasterFranchiseeInformationCurrencyCountryNeed: true,
    },
    skip: masterFranchiseId ? false : true,
  });

  const masterFranchiseeInformation =
    data?.filterMasterFranchiseeInformation?.edges?.[0]?.node;

  return (
    <div className="max-w-5xl space-y-6">
      <TitleAndBreadcrumb
        title={`${
          masterFranchiseId && !Number.isNaN(+masterFranchiseId) ? "" : "Create"
        } Master Setting`}
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: `${
              masterFranchiseId && !Number.isNaN(+masterFranchiseId)
                ? ""
                : "Create"
            } Master Setting`,
            to: "/master-setting",
            params: {
              masterFranchiseId: masterFranchiseId as unknown as undefined,
            },
          },
        ]}
      />
      <Tab.Group
        selectedIndex={selectedTabIndex}
        onChange={(index) => {
          setSelectedTabIndex(index);
          navigate({
            to: "/master-setting",
            search: {
              page:
                updatedTabList?.filter((_tab, i) => i === index)?.[0]?.name ??
                "GENERAL",
            },
          });
        }}
        as={"div"}
        className={combineClassName(
          "bg-white rounded shadow-elevation p-5 sm:p-8"
        )}
      >
        <Tab.List
          className={combineClassName(
            "flex overflow-x-auto xl:pl-10 transition-all duration-300"
          )}
        >
          {masterFranchiseId &&
            updatedTabList?.map((tab) => {
              return (
                <TabItem
                  key={tab?.id}
                  mfInfoId={masterFranchiseId}
                  id={tab?.id}
                  name={tab?.name}
                  subTitle={tab?.subTitle}
                  aclName={tab?.aclName}
                />
              );
            })}
        </Tab.List>
        <Tab.Panels as={Fragment}>
          {updatedTabPanelsList()?.map((Component, index) => {
            return (
              <Tab.Panel key={index}>
                <Component
                  navigateMasterFranchiseeTabHandler={
                    navigateMasterFranchiseeTabHandler
                  }
                  masterFranchiseeInformation={masterFranchiseeInformation}
                />
              </Tab.Panel>
            );
          })}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default MasterFranchiseeMasterSetting;
