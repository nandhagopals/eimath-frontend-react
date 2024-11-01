import { FC } from "react";
import { Tab } from "@headlessui/react";

import { combineClassName } from "global/helpers";

interface Props {
  tab: "ORDER WITH HQ" | "WITH FRANCHISEE" | "PENDING" | "PROCESSED";
}

const TabItem: FC<Props> = ({ tab }) => {
  return (
    <Tab
      className={({ selected }) =>
        combineClassName(
          "min-w-[160px] flex justify-center items-center border-b-2 py-2 px-3 text-secondary-text text-sm font-medium focus:outline-none",
          selected
            ? "border-primary-main text-primary-main"
            : "border-transparent"
        )
      }
    >
      {tab}
    </Tab>
  );
};

export { TabItem };
