import { type FC, Fragment } from "react";

import type { NodeState } from "global/hook";

import { ResourceId } from "modules/Accounts/RoleAccess/types";
import Row from "modules/Accounts/RoleAccess/Page/RoleAccessForm/ACL/Row";

interface Props {
  aclTree: ResourceId[];
  level: number;
  expandAll?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectNode: (id: any, isChecked: boolean) => any[];
  state: NodeState<string>;
}

const Tree: FC<Props> = ({ aclTree, level, expandAll, selectNode, state }) => {
  return (
    <Fragment>
      {Array.isArray(aclTree) &&
        aclTree?.map((item) => (
          <Row
            item={item}
            level={level}
            key={item.id}
            expandAll={expandAll}
            selectNode={selectNode}
            state={state}
          >
            <Tree
              key={item?.id}
              aclTree={item?.childNodes || []}
              level={level + 1}
              selectNode={selectNode}
              state={state}
            />
          </Row>
        ))}
    </Fragment>
  );
};

export default Tree;
