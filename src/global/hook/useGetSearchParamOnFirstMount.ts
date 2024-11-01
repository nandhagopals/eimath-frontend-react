import {
  RootSearchSchema,
  RouteById,
  RouteIds,
  FullSearchSchema,
  AnyRoute,
  RegisteredRouter,
  useSearch,
} from "@tanstack/react-router";

import { useRef } from "react";

export type StringLiteral<T> = T extends string
  ? string extends T
    ? string
    : T
  : never;
export type StrictOrFrom<TFrom, TReturnIntersection extends boolean = false> =
  | {
      from: StringLiteral<TFrom> | TFrom;
      strict?: true;
    }
  | {
      from?: never;
      strict: false;
      experimental_returnIntersection?: TReturnIntersection;
    };

const useGetSearchParamOnFirstMount = <
  TRouteTree extends AnyRoute = RegisteredRouter["routeTree"],
  TFrom extends RouteIds<TRouteTree> = RouteIds<TRouteTree>,
  TReturnIntersection extends boolean = false,
  TSearch = TReturnIntersection extends false
    ? Exclude<
        RouteById<TRouteTree, TFrom>["types"]["fullSearchSchema"],
        RootSearchSchema
      >
    : Partial<Omit<FullSearchSchema<TRouteTree>, keyof RootSearchSchema>>,
  TSelected = TSearch
>(
  opts: StrictOrFrom<TFrom, TReturnIntersection> & {
    select?: (search: TSearch) => TSelected;
  }
): TSelected => {
  const search = useSearch<
    TRouteTree,
    TFrom,
    TReturnIntersection,
    TSearch,
    TSelected
  >(opts);

  const searchParamRef = useRef<TSelected>(search);

  return searchParamRef?.current;
};

export default useGetSearchParamOnFirstMount;
