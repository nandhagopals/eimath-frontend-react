import { FC } from "react";
import { Tab } from "@headlessui/react";

import { useAllowedResource } from "global/hook";
import { combineClassName } from "global/helpers";

interface Props {
  mfInfoId: number | "new";
  id: number;
  name:
    | "INFORMATION"
    | "GENERAL"
    | "TERM FEES"
    | "WORKBOOK FEES"
    | "PRODUCT FEES";
  subTitle?: string;
  aclName: string;
}

const TabItem: FC<Props> = ({ mfInfoId, id, name, subTitle, aclName }) => {
  const canViewTab = useAllowedResource(aclName);

  return (
    canViewTab && (
      <Tab
        key={id}
        disabled={
          mfInfoId === "new" ? (name === "INFORMATION" ? false : true) : false
        }
        className={({ selected }) =>
          combineClassName(
            "min-w-[160px] flex justify-center items-center border-b-2 py-2 px-3 text-secondary-text text-sm font-medium focus:outline-none",
            selected
              ? "border-primary-main text-primary-main"
              : "border-transparent"
          )
        }
      >
        <div>
          <p>{name}</p>
          {subTitle && <p>{subTitle}</p>}
        </div>
      </Tab>
    )
  );
};

export default TabItem;
