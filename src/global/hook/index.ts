export * from "global/hook/helpers";

import useAuth from "global/hook/useAuth";
import useFormWithZod from "global/hook/useFormWithZod";
import useLatest from "global/hook/useLatest";
import useInView, { Observe } from "global/hook/useInView";
import usePreLoading from "global/hook/usePreLoading";
import useEventListener from "global/hook/useEventListener";
import useUnmount from "global/hook/useUnmount";
import useIsomorphicLayoutEffect from "global/hook/useIsomorphicLayoutEffect";
import useEffectWithTarget from "global/hook/useEffectWithTarget";
import useWindowSize from "global/hook/useWindowSize";
import useSearch from "global/hook/useSearch";
import useCheckboxTree, { type NodeState } from "global/hook/useCheckboxTree";
import {
  useAllowedResource,
  useFindIsResourceIdsHasChecked,
} from "global/hook/useAllowedResource";
import useRouteSearch from "global/hook/useGetSearchParamOnFirstMount";
import useGetSearchParamOnFirstMount from "global/hook/useGetSearchParamOnFirstMount";
import useIsMounted from "global/hook/useIsMounted";
import useResizeObserver from "global/hook/useResizeObserver";
import useDebounceCallback from "global/hook/useDebounceCallback";
import usePagination from "global/hook/usePagination";
import useMeasure from "global/hook/useMeasure";

export {
  useAuth,
  useFormWithZod,
  useInView,
  usePreLoading,
  useLatest,
  useUnmount,
  useIsomorphicLayoutEffect,
  useEffectWithTarget,
  useEventListener,
  useWindowSize,
  useSearch,
  useCheckboxTree,
  useAllowedResource,
  useFindIsResourceIdsHasChecked,
  useRouteSearch,
  useGetSearchParamOnFirstMount,
  useIsMounted,
  useResizeObserver,
  useDebounceCallback,
  usePagination,
  useMeasure
};
export type { Observe, NodeState };
