import type { FC } from "react";

import type { CustomCheckboxProps } from "components/Form/Checkbox";

import CheckBoxCheckedIcon from "global/assets/images/check-box-checked.svg?react";
import CheckBoxUncheckedIcon from "global/assets/images/check-box-unchecked.svg?react";
import CheckBoxIndeterminateIcon from "global/assets/images/check-box-indeterminate.svg?react";
import { combineClassName } from "global/helpers";

const CustomCheckbox: FC<CustomCheckboxProps> = ({
  isChecked,
  isIndeterminate,
  onClick,
  className,
  error,
  disabled,
  readOnly,
}) => {
  return isChecked ? (
    <CheckBoxCheckedIcon
      onClick={onClick}
      className={combineClassName(
        readOnly
          ? "cursor-default"
          : disabled
          ? "cursor-not-allowed"
          : "cursor-pointer",
        error?.message ? "text-error-main" : "text-primary-main",
        className
      )}
    />
  ) : isIndeterminate ? (
    <CheckBoxIndeterminateIcon
      onClick={onClick}
      className={combineClassName(
        readOnly
          ? "cursor-default"
          : disabled
          ? "cursor-not-allowed"
          : "cursor-pointer",
        error?.message ? "text-error-main" : "text-primary-main",
        className
      )}
    />
  ) : (
    <CheckBoxUncheckedIcon
      onClick={onClick}
      className={combineClassName(
        readOnly
          ? "cursor-default"
          : disabled
          ? "cursor-not-allowed"
          : "cursor-pointer",
        error?.message ? "text-error-main" : "text-action-active",
        className
      )}
    />
  );
};

export default CustomCheckbox;
