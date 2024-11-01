import { type ComponentPropsWithoutRef, forwardRef } from "react";

import { combineClassName } from "global/helpers";

interface Props extends ComponentPropsWithoutRef<"div"> {
  smallLoading?: boolean;
  color?: "secondary" | "primary" | "default" | "tertiary";
  classForLoading?: string;
  hideLoading?: boolean;
}

const Loading = forwardRef<HTMLDivElement, Props>(
  (
    {
      className,
      smallLoading = false,
      color,
      classForLoading,
      hideLoading,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={combineClassName(
          "flex justify-center items-center",
          className
        )}
        {...props}
        ref={ref}
      >
        {hideLoading ? null : (
          <span
            className={combineClassName(
              "border-4 rounded-full animate-spin mx-auto",
              smallLoading ? "w-5 h-5" : "w-10 h-10",
              color === "secondary"
                ? "border-error-main"
                : color === "primary"
                ? "border-primary-main"
                : color === "tertiary"
                ? "border-success-main"
                : "border-white",
              "border-t-transparent",
              classForLoading
            )}
          />
        )}
      </div>
    );
  }
);

export default Loading;
