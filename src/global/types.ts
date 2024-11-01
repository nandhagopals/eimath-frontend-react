/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction } from "react";

import { AuthContext } from "components/AuthProvider/type";
import { ApolloQueryResult, OperationVariables } from "@apollo/client";

interface AuthUserDetails {
  id: number;
  type: "None" | "User" | "MF Owner" | "MF Staff" | "Franchisee" | "MF";
}

interface RouteContext {
  auth: AuthContext;
}

type SetState<T> = Dispatch<SetStateAction<T>>;

type Nullish<T> = T extends object
  ? {
      [K in keyof T]?: T[K] | null;
    }
  : T | null | undefined;

type FilterBetween = Nullish<{
  from: string;
  to: string;
}>;

type DateTime = string;

type FilterString = Nullish<{
  contains: string;
  endsWith: string;
  inArray: string[];
  isBlank: boolean;
  isExactly: string;
  isPresent: boolean;
  notContains: string;
  startsWith: string;
  notInArray: string[];
}>;

type FilterInteger = Nullish<{
  between: FilterBetween;
  contains: number[];
  greaterThan: number;
  isBlank: boolean;
  isPresent: boolean;
  lessThan: number;
  notContains: number[];
  number: number;
}>;

type FilterFloat = Nullish<{
  between: FilterBetween;
  isBlank: boolean;
  isPresent: boolean;
  number: number;
}>;

type FilterDate = Nullish<{
  between: FilterBetween;
  date: string;
  isBlank: boolean;
  isPresent: boolean;
  lastWeek: boolean;
  thisWeek: boolean;
  today: boolean;
  yesterday: boolean;
}>;

type FilterTime = Nullish<{
  between: FilterBetween;
  greaterThan: string;
  isBlank: boolean;
  isPresent: boolean;
  lessThan: string;
  time: string;
}>;

type FilterDateTime = Nullish<{
  between: FilterBetween;
  date: string;
  isBlank: boolean;
  isPresent: boolean;
  lastWeek: boolean;
  thisWeek: boolean;
  today: boolean;
  yesterday: boolean;
}>;

type PaginationInfoReturnType = Nullish<{
  startCursor: string;
  endCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalNumberOfItems: number;
  __typename: string;
}>;

type CursorPaginationReturnType<NodeType> = {
  pageInfo?: PaginationInfoReturnType | null;
  edges?:
    | {
        node?: NodeType | null;
        cursor?: string | null;
        __typename?: string | null;
      }[]
    | null;
  __typename?: string | null;
};

type PaginationArgs = Nullish<{
  after: string | null;
  before: string | null;
  size: number | null;
}>;

type SortBy<SortByValue extends string = string> = Nullish<{
  column: SortByValue;
  order: "DESC" | "ASC";
  subClassField?: string;
}>;

type CursorPaginationArgs<
  Filter extends Record<string, any> = Record<string, never>,
  SortByValue extends string = ""
> = {
  filter?: Filter | null;
  pagination?: PaginationArgs | null;
  globalSearch?: string | null;
  sortBy?: SortBy<SortByValue> | null;
};

type ReactAriaPlacement =
  | "bottom"
  | "bottom left"
  | "bottom right"
  | "bottom start"
  | "bottom end"
  | "top"
  | "top left"
  | "top right"
  | "top start"
  | "top end"
  | "left"
  | "left top"
  | "left bottom"
  | "start"
  | "start top"
  | "start bottom"
  | "right"
  | "right top"
  | "right bottom"
  | "end"
  | "end top"
  | "end bottom";

type GetArrayType<T extends any[]> = T extends (infer U)[] ? U : T;

type CommonStatus = "Active" | "Archived" | "Deleted" | "Inactive";

type User = Nullish<{
  id: number;
  name: string;
}>;

type PDF = Nullish<{
  fileName: string;
  filePath: string;
}>;

type RefetchQueryType<
  QueryReturnType,
  QueryVariables extends OperationVariables = OperationVariables
> = (
  variables?: Partial<QueryVariables> | undefined
) => Promise<ApolloQueryResult<QueryReturnType>>;

export type {
  RouteContext,
  AuthUserDetails,
  SetState,
  Nullish,
  FilterString,
  FilterInteger,
  FilterFloat,
  FilterDate,
  FilterTime,
  FilterDateTime,
  CursorPaginationArgs,
  CursorPaginationReturnType,
  ReactAriaPlacement,
  GetArrayType,
  CommonStatus,
  DateTime,
  User,
  PDF,
  RefetchQueryType,
  SortBy,
  PaginationArgs,
  PaginationInfoReturnType,
};
