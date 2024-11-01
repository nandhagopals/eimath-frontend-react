/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from "react";

type NodeId = string | number;
type Node<T extends NodeId> = {
	[key: string | number]: any;
	id: T;
	childNodes?: Nodes<T>;
};

type Nodes<T extends NodeId> = Array<Node<T>>;

interface FlatNode<T extends NodeId> extends Node<T> {
  pid: T | null;
  depth: number;
  isAllowed?: boolean;
  isIntermediate?: boolean;
  childNodes?: Array<Node<T>>;
}

type FlatNodesMap<T extends NodeId> = Map<T, FlatNode<T>>;

type CheckboxState = boolean | "indeterminate";

type NodeState<T extends NodeId> = { [key in T]: CheckboxState };

const addToSet = <T>(set: Set<T>, value: T, is: boolean): Set<T> => {
  if (is) {
    set.add(value);
  } else {
    set.delete(value);
  }

  return set;
};

const flattenNodes = <T extends NodeId>(nodes: Nodes<T>): FlatNodesMap<T> => {
  const flatMap: FlatNodesMap<T> = new Map();

  const flatten = (node: Node<T>, pid: T | null = null, depth = 0) => {
    if (flatMap.has(node.id)) {
      throw Error(`Found duplicate entries in tree for node: ${node.id}`);
    }

    flatMap.set(node.id, {
      ...node,
      pid,
      depth,
    });

    node.childNodes?.forEach((child) => flatten(child, node.id, depth + 1));
  };

  nodes.forEach((node) => flatten(node, null, 0));
  return flatMap;
};

const toggleChildren = <T extends NodeId>(
  nodeId: T,
  isChecked: boolean,
  flatNodes: FlatNodesMap<T>,
  checkedSet: Set<T>
) => {
  const node = flatNodes.get(nodeId);

  if (!node?.childNodes?.length) {
    return;
  }

  node.childNodes.forEach((child) => {
    addToSet<T>(checkedSet, child.id, isChecked);

    if (child.childNodes?.length && child.childNodes?.length > 0) {
      toggleChildren(child.id, isChecked, flatNodes, checkedSet);
    }
  });
};

const toggleParent = <T extends NodeId>(
  nodeId: T,
  checkedSet: Set<T>,
  flatNodes: FlatNodesMap<T>
) => {
  const node = flatNodes.get(nodeId);

  if (!node || !node.pid) {
    return;
  }

  const parent = flatNodes.get(node.pid) as Node<T>;

  if (!parent || !parent.childNodes || !parent.childNodes.length) {
    return;
  }

  const allChecked = parent?.childNodes.every((child) =>
    checkedSet.has(child.id)
  );
  addToSet<T>(checkedSet, parent.id, allChecked);
  toggleParent(parent.id, checkedSet, flatNodes);
};

const useCheckboxTree = <T extends NodeId = number>(
  nodes: Nodes<T>,
  initialChecked: T[] = []
) => {
  const [checked, setChecked] = useState<T[]>(initialChecked);

  const flatNodes = flattenNodes(nodes);

  const selectNode = useCallback(
    (id: T, isChecked: boolean) => {
      const checkedSet = new Set<T>(checked);

      if (!flatNodes.has(id)) {
        return checked;
      }

      addToSet<T>(checkedSet, id, isChecked);
      toggleChildren<T>(id, isChecked, flatNodes, checkedSet);
      toggleParent<T>(id, checkedSet, flatNodes);

      const checkedItems = [...checkedSet];

      setChecked(checkedItems);
      return checkedItems;
    },
    [checked, flatNodes]
  );

  const clear = useCallback(() => {
    setChecked([]);
  }, []);

  const state = useMemo(() => {
    const nodeState = {} as NodeState<T>;

    const isNodeIndeterminate = (node: Node<T>) => {
      let isIndeterminate = false;
      const { childNodes = [] } = node;

      isIndeterminate = childNodes.some((child) => checked.includes(child.id));

      if (!isIndeterminate) {
        childNodes?.forEach((child) => {
          if (isNodeIndeterminate(child)) {
            // Break the loop when any child is indeterminate by OX-softwares team
            isIndeterminate = isNodeIndeterminate(child);
            return;
          }
        });
      }

      return isIndeterminate;
    };

    flatNodes?.forEach((node: FlatNode<T>) => {
      const isChecked = checked.includes(node.id);
      const isIndeterminate = !isChecked && isNodeIndeterminate(node);
      const checkboxState: CheckboxState = isIndeterminate
        ? "indeterminate"
        : isChecked;
      nodeState[node.id] = checkboxState;
    });

    return nodeState;
  }, [checked, flatNodes]);

	const indeterminate = useMemo(() => {
		return Object.keys(state).reduce<T[]>((prev, id) => {
			const nodeId = id as T;

			if (state[nodeId] === "indeterminate") {
				// biome-ignore lint/performance/noAccumulatingSpread: <explanation>
				return [...prev, nodeId];
			}
			
      return prev;
    }, []);
  }, [state]);

  return {
    checked,
    state,
    indeterminate,
    selectNode,
    clear,
    setChecked,
  } as const;
};

export default useCheckboxTree;
export { flattenNodes };
export type { NodeState };
