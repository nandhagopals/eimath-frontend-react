import { forwardRef } from "react";
import { Button as _Button } from "react-aria-components";

import { ButtonProps } from "components/Buttons";
import { Loading } from "components/Loading";

import { combineClassName } from "global/helpers";

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "filled",
      children,
      loading,
      loadingColor,
      isDisabled,
      ...props
    },
    ref
  ) => {
    return (
      <_Button
        className={(values) =>
          combineClassName(
            "w-full px-[22px] py-[7px] rounded border font-roboto font-medium leading-[26px] focus:outline-none shadow-elevation",
            variant === "filled"
              ? "bg-gradient-to-r from-linear-primary to-linear-secondary hover:from-linear-secondary-gradient-l hover:to-linear-gradient-secondary text-primary-contrast shadow-lg"
              : "bg-primary-contrast text-primary-main border-primary-main",
            values?.isDisabled ? "cursor-default" : "",
            typeof className === "function" ? className(values) : className
          )
        }
        ref={ref}
        {...props}
        isDisabled={loading ? true : isDisabled}
      >
        {loading ? (
          <Loading
            smallLoading
            className={combineClassName("py-[3px] w-full")}
            color={
              loadingColor
                ? loadingColor
                : variant === "outlined"
                ? "primary"
                : undefined
            }
          />
        ) : (
          children
        )}
      </_Button>
    );
  }
);
Button.displayName = "Button";

export default Button;
