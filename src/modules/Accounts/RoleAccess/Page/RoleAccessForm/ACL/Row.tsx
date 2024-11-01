import { type FC, Fragment, type ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { CustomCheckbox } from "components/Form";

import type { NodeState } from "global/hook";
import ArrowRightIcon from "global/assets/images/chevron-right-filled.svg?react";

import type { ResourceId } from "modules/Accounts/RoleAccess";

interface Props {
  item: ResourceId;
  level: number;
  expandAll?: boolean;
  children?: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectNode: (id: any, isChecked: boolean) => any[];
  state: NodeState<string>;
}

const Row: FC<Props> = ({
  item,
  level,
  children,
  expandAll,
  selectNode,
  state,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (expandAll === undefined) {
      setIsCollapsed(true);
    } else if (expandAll === false) {
      setIsCollapsed(false);
    } else {
      setIsCollapsed(expandAll);
    }
  }, [setIsCollapsed, expandAll]);

  //   const entityIcon =
  //     item.childNodes?.length !== 0 ? (
  //       isCollapsed ? (
  //         <HiFolderOpen className="w-5 h-5 text-primary/80 mx-1" />
  //       ) : (
  //         <HiFolder className="w-5 h-5 text-primary/80 mx-1" />
  //       )
  //     ) : (
  //       <HiDocumentText className="w-5 h-5 text-primary/80 mx-1" />
  //     );

  const [isChecked, setIsChecked] = useState(
    state[item.id] === "indeterminate" ? true : (state[item.id] as boolean)
  );

  useEffect(() => {
    setIsChecked(
      state[item.id] === "indeterminate" ? true : (state[item.id] as boolean)
    );
  }, [state, item.id]);

  const changeHandler = () => {
    setIsChecked(!isChecked);
    selectNode(item?.id, !isChecked);
  };

  return (
    <Fragment key={item?.id}>
      <div
        style={{ paddingLeft: `${level * 20}px` }}
        className={`flex items-center w-min  ${
          item?.childNodes && item?.childNodes?.length > 0 ? "" : "ml-[24px]"
        }`}
      >
        {item?.childNodes && item?.childNodes?.length > 0 ? (
          <span>
            <ArrowRightIcon
              className={`w-5 h-5 text-primary cursor-pointer mx-1 ${
                isCollapsed ? "-rotate-90" : ""
              }`}
              onClick={() => setIsCollapsed(!isCollapsed)}
            />
          </span>
        ) : null}
        <CustomCheckbox
          isChecked={
            state[item.id] === "indeterminate"
              ? false
              : (state[item.id] as boolean)
          }
          isIndeterminate={state[item.id] === "indeterminate"}
          onClick={changeHandler}
        />
        {/* {entityIcon} */}
        <span className="text-ironside-gray whitespace-nowrap">
          {item?.title}
        </span>
      </div>
      <AnimatePresence mode="wait">
        {isCollapsed && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: {
                  duration: 0.4,
                },
                opacity: {
                  duration: 0.25,
                  delay: 0.15,
                },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  duration: 0.4,
                },
                opacity: {
                  duration: 0.25,
                },
              },
            }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Fragment>
  );
};

export default Row;
