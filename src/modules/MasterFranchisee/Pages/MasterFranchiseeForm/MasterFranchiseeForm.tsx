import { Fragment, useState } from "react";
import { Tab } from "@headlessui/react";
import { useNavigate, useParams } from "@tanstack/react-router";

import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";

import { combineClassName } from "global/helpers";
import { useRouteSearch } from "global/hook";

import {
  tabPanels,
  tabs,
  Page,
  TabItem,
  FILTER_MASTER_FRANCHISEE_INFORMATION,
} from "modules/MasterFranchisee";
import { useQuery } from "@apollo/client";

const MasterFranchiseeForm = () => {
  const navigate = useNavigate();

  const { infoId } = useParams({
    from: "/private-layout/master-franchisee/$infoId",
  });

  const { page } = useRouteSearch({
    from: "/private-layout/master-franchisee/$infoId",
  });

  const [selectedTabIndex, setSelectedTabIndex] = useState(
    tabs?.filter((tab) => tab?.name === page)?.[0]?.id ?? 0
  );

  const navigateMasterFranchiseeTabHandler = (page: Page) => {
    switch (page) {
      case "INFORMATION":
        navigate({
          to: "/master-franchisee/$infoId",
          params: {
            infoId,
          },
          search: {
            page,
          },
        });
        setSelectedTabIndex(0);
        break;
      case "GENERAL":
        navigate({
          to: "/master-franchisee/$infoId",
          params: {
            infoId,
          },
          search: {
            page,
          },
        });
        setSelectedTabIndex(1);
        break;
      case "TERM FEES":
        navigate({
          to: "/master-franchisee/$infoId",
          params: {
            infoId,
          },
          search: {
            page,
          },
        });
        setSelectedTabIndex(2);
        break;
      case "WORKBOOK FEES":
        navigate({
          to: "/master-franchisee/$infoId",
          params: {
            infoId,
          },
          search: {
            page,
          },
        });
        setSelectedTabIndex(3);
        break;
      case "PRODUCT FEES":
        navigate({
          to: "/master-franchisee/$infoId",
          params: {
            infoId,
          },
          search: {
            page,
          },
        });
        setSelectedTabIndex(4);
        break;
      default:
        break;
    }
  };

  const { data } = useQuery(FILTER_MASTER_FRANCHISEE_INFORMATION, {
    fetchPolicy: "cache-and-network",
    variables: {
      filter: {
        id: {
          number: +infoId,
        },
      },
      isMasterFranchiseeInformationCurrencyCountryNeed: true,
    },
    skip: infoId && !Number.isNaN(+infoId) ? false : true,
  });

  const masterFranchiseeInformation =
    data?.filterMasterFranchiseeInformation?.edges?.[0]?.node;

  return (
    <div className="max-w-5xl space-y-6 py-2">
      <TitleAndBreadcrumb
        title={`${
          infoId && !Number.isNaN(+infoId) ? "" : "Create"
        } Master Franchisee Account`}
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Master Franchisee Account",
            to: "/master-franchisee",
          },
          {
            name: `${
              infoId && !Number.isNaN(+infoId) ? "Edit" : "Create"
            } Master Franchisee Account`,
            to: "/master-franchisee/$infoId",
            params: { infoId: infoId as unknown as undefined },
          },
        ]}
      />

      <Tab.Group
        selectedIndex={selectedTabIndex}
        onChange={(index) => {
          setSelectedTabIndex(index);
          navigate({
            to: "/master-franchisee/$infoId",
            params: { infoId },
            search: {
              page:
                tabs?.filter((tab) => tab?.id === index)?.[0]?.name ??
                "INFORMATION",
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
          {tabs?.map((tab) => {
            return (
              <TabItem
                mfInfoId={infoId}
                id={tab?.id}
                name={tab?.name}
                aclName={tab?.aclName}
                subTitle={tab?.subTitle}
                key={tab?.id}
              />
            );
          })}
        </Tab.List>
        <Tab.Panels as={Fragment}>
          {tabPanels?.map((Component, index) => {
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

export default MasterFranchiseeForm;
