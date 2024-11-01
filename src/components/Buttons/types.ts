import type { ButtonProps as _ButtonProps } from "react-aria-components";

type ButtonProps = _ButtonProps & {
  variant?: "filled" | "outlined";
  loading?: boolean;
  loadingColor?: "secondary" | "primary" | "default" | "tertiary";
};

export type { ButtonProps };
