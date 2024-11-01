import { useCallback, useEffect, useRef, useState } from "react";

import { useLatest } from "global/hook";

const observerErr =
  "useInView: the browser doesn't support Intersection Observer";
const observerWarn =
  "userInView: the browser doesn't support Intersection Observer";

interface IntersectionObserverInitV2 extends IntersectionObserverInit {
  readonly trackVisibility?: boolean;
  readonly delay?: number;
}

interface IntersectionObserverEntryV2 extends IntersectionObserverEntry {
  readonly isVisible?: boolean;
}

interface ScrollDirection {
  vertical?: "up" | "down";
  horizontal?: "left" | "right";
}

type Observe<T> = (element?: T | null) => void;

interface Event<T> {
  readonly entry: IntersectionObserverEntryV2;
  readonly scrollDirection: ScrollDirection;
  observe: Observe<T>;
  unobserve: () => void;
}

interface Options<T> {
  root?: HTMLElement | null;
  rootMargin?: string;
  threshold?: number | number[];
  trackVisibility?: boolean;
  delay?: number;
  unobserveOnEnter?: boolean;
  onChange?: (event: Event<T> & { inView: boolean }) => void;
  onEnter?: (event: Event<T>) => void;
  onLeave?: (event: Event<T>) => void;
}

interface Return<T> extends Omit<Event<T>, "entry"> {
  inView: boolean;
  entry?: IntersectionObserverEntryV2;
  updatePosition: () => void;
}

interface State {
  inView: boolean;
  scrollDirection: ScrollDirection;
  entry?: IntersectionObserverEntryV2;
}

const useInView = <T extends HTMLElement | null>({
  root,
  rootMargin,
  threshold = 0,
  trackVisibility,
  delay,
  unobserveOnEnter,
  onChange,
  onEnter,
  onLeave,
}: Options<T> = {}): Return<T> => {
  const [state, setState] = useState<State>({
    inView: false,
    scrollDirection: {},
  });
  const prevInViewRef = useRef(false);
  const prevPosRef = useRef<{ x?: number; y?: number }>({});
  const observerRef = useRef<IntersectionObserver | null>();
  const warnedRef = useRef(false);
  const onChangeRef = useLatest(onChange);
  const onEnterRef = useLatest(onEnter);
  const onLeaveRef = useLatest(onLeave);
  const ref = useRef<T>();

  const unobserve = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      prevPosRef.current = {};
    }
  }, []);

  const observe = useCallback<Observe<T>>(
    (element) => {
      if (element && element !== ref.current) {
        unobserve();
        ref.current = element;
      }
      if (observerRef.current && ref.current)
        observerRef.current.observe(ref.current);
    },
    [unobserve]
  );

  const updatePosition = useCallback(() => {
    if (!ref.current) return;

    const { x, y } = ref.current.getBoundingClientRect();
    prevPosRef.current = { x, y };
  }, [ref]);

  useEffect(() => {
    if (
      !("IntersectionObserver" in window) ||
      !("IntersectionObserverEntry" in window)
    ) {
      console.error(observerErr);
      return () => null;
    }

    let isActive = true;

    observerRef.current = new IntersectionObserver(
      ([entry]: IntersectionObserverEntryV2[]) => {
        const {
          intersectionRatio,
          isIntersecting,
          boundingClientRect: { x, y },
          isVisible,
        } = entry;
        const scrollDirection: ScrollDirection = {};
        const min = Array.isArray(threshold)
          ? Math.min(...threshold)
          : threshold;
        let inView =
          isIntersecting !== undefined ? isIntersecting : intersectionRatio > 0;
        inView = min > 0 ? intersectionRatio >= min : inView;
        if (prevPosRef.current?.x !== undefined) {
          if (x < prevPosRef.current.x) scrollDirection.horizontal = "left";
          if (x > prevPosRef.current.x) scrollDirection.horizontal = "right";
        }
        prevPosRef.current.x = x;

        if (prevPosRef.current?.y !== undefined) {
          if (y < prevPosRef.current.y) scrollDirection.vertical = "up";
          if (y > prevPosRef.current.y) scrollDirection.vertical = "down";
        }
        prevPosRef.current.y = y;

        prevPosRef.current.y = y;

        const e = { entry, scrollDirection, observe, unobserve };

        if (trackVisibility) {
          if (isVisible === undefined && !warnedRef.current) {
            console.warn(observerWarn);
            warnedRef.current = true;
          }
          if (isVisible !== undefined) inView = isVisible;
        }

        if (inView && !prevInViewRef.current) {
          if (unobserveOnEnter) unobserve();
          if (onEnterRef.current) onEnterRef.current(e);
        }

        if (!inView && prevInViewRef.current && onLeaveRef.current)
          onLeaveRef.current(e);

        if (onChangeRef.current) onChangeRef.current({ ...e, inView });

        if (isActive) setState({ inView, scrollDirection, entry });
        prevInViewRef.current = inView;
      },
      {
        root,
        rootMargin,
        threshold,
        trackVisibility,
        delay,
      } as IntersectionObserverInitV2
    );

    observe();

    return () => {
      isActive = false;
      unobserve();
    };
  }, [
    unobserveOnEnter,
    root,
    rootMargin,
    JSON.stringify(threshold),
    trackVisibility,
    delay,
    observe,
    unobserve,
  ]);

  return { ...state, observe, unobserve, updatePosition };
};

export default useInView;

export type { Observe };
