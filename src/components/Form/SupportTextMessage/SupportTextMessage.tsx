import { FC } from "react";
import { FieldError } from "react-hook-form";

import { SupportText as ISupportText } from "components/Form/SupportTextMessage";

import { combineClassName } from "global/helpers";

interface Props {
  supportText: ISupportText | undefined;
  error: FieldError | undefined;
}

const SupportTextMessage: FC<Props> = ({ supportText, error }) => {
  return supportText?.text || error?.message ? (
    <p
      className={combineClassName(
        "w-full px-4 text-xs py-1 font-roboto font-normal",
        error?.message
          ? "text-error-main visible"
          : supportText?.text
          ? "visible text-secondary-text"
          : "invisible",
        supportText?.className
      )}
    >
      {error?.message || supportText?.text || "Helper text"}
    </p>
  ) : null;
};

export default SupportTextMessage;
