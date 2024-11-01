/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DependencyList, MutableRefObject } from "react";

const noop = () => {};

const on = <T extends Window | Document | HTMLElement | EventTarget>(
  obj: T | null,
  ...args:
    | Parameters<T["addEventListener"]>
    | [string, (() => void) | null, ...any]
): void => {
  if (obj?.addEventListener) {
    obj.addEventListener(
      ...(args as Parameters<HTMLElement["addEventListener"]>)
    );
  }
};

const off = <T extends Window | Document | HTMLElement | EventTarget>(
  obj: T | null,
  ...args:
    | Parameters<T["removeEventListener"]>
    | [string, (() => void) | null, ...any]
): void => {
  if (obj?.removeEventListener) {
    obj.removeEventListener(
      ...(args as Parameters<HTMLElement["removeEventListener"]>)
    );
  }
};

const isFunction = (value: unknown): value is () => void =>
  typeof value === "function";

const isBrowser = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

const isNavigator = typeof navigator !== "undefined";

type TargetValue<T> = T | undefined | null;

type TargetType = HTMLElement | Element | Window | Document;

type BasicTarget<T extends TargetType = Element> =
  | (() => TargetValue<T>)
  | TargetValue<T>
  | MutableRefObject<TargetValue<T>>;

const getTargetElement = <T extends TargetType>(
  target: BasicTarget<T>,
  defaultElement?: T
) => {
  if (!isBrowser) {
    return undefined;
  }

  if (!target) {
    return defaultElement;
  }

  let targetElement: TargetValue<T>;

  if (isFunction(target)) {
    targetElement = target();
  } else if ("current" in target) {
    targetElement = target.current;
  } else {
    targetElement = target;
  }

  return targetElement;
};

const depsAreSame = (
  oldDeps: DependencyList,
  deps: DependencyList
): boolean => {
  if (oldDeps === deps) return true;
  for (let i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], deps[i])) return false;
  }
  return true;
};

const isDev =
  import.meta.env.NODE_ENV === "development" ||
  import.meta.env.NODE_ENV === "test";

export {
  noop,
  on,
  off,
  isFunction,
  isBrowser,
  isDev,
  isNavigator,
  depsAreSame,
  getTargetElement,
};

export type { BasicTarget };
