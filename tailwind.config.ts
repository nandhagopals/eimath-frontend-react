import type { Config } from "tailwindcss";
import {
  animatePlugin,
  containerQueriesPlugin,
} from "./src/global/helpers/tailwindcss-plugin";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      minWidth: (theme: any) => {
        return { ...theme("maxWidth") };
      },
      fontFamily: {
        sunbird: ["Sunbird", "sans"],
        roboto: ["Roboto", "sans-serif"],
      },
      colors: {
        "primary-main": "#FF5F00",
        "primary-text": "#000000DE",
        "secondary-text": "#00000099",
        "outline-border": "#0000003B",
        "primary-contrast": "#FFFFFF",
        "linear-primary": "#FF8C21",
        "linear-secondary": "#F5576E",
        "error-main": "#D32F2F",
        "secondary-main": "#4FACF1",
        "secondary-dark": "#015B9D",
        "primary-shade": "#FF5F0014",
        "action-active": "#0000008A",
        "action-hover": "#0000000A",
        "action-disabled": "#00000042",
        "primary-dark": "#381500",
        "secondary-button": "#E0E0E0",
        "linear-gradient-secondary": "#FAC74D",
        "primary-light": "#FFE9DC",
        "disable-text": "#00000061",
        "background-default": "#FAFAFA",
        "other-standard-input-line": "#0000006B",
        "secondary-button-hover": "#F5F5F5",
        "success-main": "#2E7D6F",
        "error-dark": "#C62828",
        "outline-light": "#E0E0E0",
        "dark-jungle-green": "#202223",
        "action-selected": "#00000014",
        "standard-input-line": "#0000006B",
        "linear-secondary-gradient-l": "#FF8C21",
        "accordion-header": "#3056740A",
        "accordion-body": "#E1DBDB",
        "warning-main": "#ED6C02",
        "info-main": "#0288D1",
      },
      boxShadow: {
        elevation:
          "0px 1px 5px 0px #0000001F, 0px 2px 2px 0px #00000024, 0px 3px 1px -2px #00000033",
        "card-outline": "0px 0px 0px 1px #E0E0E0",
        "gradient-elevation":
          " 0px 1px 18px 0px #0000001F, 0px 6px 10px 0px #00000024, 0px 3px 5px -1px #FF5F0033",
        "card-light": "0px 2px 10px 0px #0000001A",
      },

      keyframes: {
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeOut: {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        fadeIn: "fadeIn 300ms ease-out",
        fadeOut: "fadeOut 300ms ease-in",
      },
    },
  },
  plugins: [animatePlugin, containerQueriesPlugin],
} satisfies Config;
