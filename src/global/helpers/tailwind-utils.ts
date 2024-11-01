import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const combineClassName = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export { combineClassName };
