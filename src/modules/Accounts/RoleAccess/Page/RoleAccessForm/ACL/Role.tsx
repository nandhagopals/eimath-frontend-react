import type { FC } from "react";

import { Button } from "components/Buttons";

import type { NodeState } from "global/hook";

import { ResourceId } from "modules/Accounts/RoleAccess";
import Tree from "modules/Accounts/RoleAccess/Page/RoleAccessForm/ACL/Tree";

interface Props {
  expandAll: boolean;
  expandAllClickHandler: () => void;
  aclTree: ResourceId[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectNode: (id: any, isChecked: boolean) => any[];
  state: NodeState<string>;
  hideExpandAll?: boolean;
}

const Role: FC<Props> = ({
  expandAll,
  expandAllClickHandler,
  aclTree,
  selectNode,
  state,
  hideExpandAll = false,
}) => {
  return (
    <div className="w-full space-y-4">
      {!hideExpandAll && (
        <div className="flex justify-end">
          <Button
            type="button"
            children={expandAll ? "Collapse All" : "Expand All"}
            onPress={expandAllClickHandler}
            className="w-min whitespace-nowrap"
          />
        </div>
      )}
      <div className="border rounded-lg border-outline-variant p-6 min-h-[calc(100vh-35vh)] max-h-[calc(100vh-35vh)] overflow-auto">
        <Tree
          aclTree={aclTree}
          level={0}
          expandAll={expandAll}
          selectNode={selectNode}
          state={state}
        />
      </div>
    </div>
  );
};

export default Role;
